---
title: 3 tips for upgrading the performance of your Svelte stores
date: 2022-01-08
---

Svelte's store system is an elegant, but low-level, implementation of a fully fletched state management system.
Stores themselves are not very complex, and most of the "magic" behind reactive global state in Svelte is caused by Svelte's internal reactivity model.

You don't actually have to use the store exported from `svelte/store` to get reactive global state. As long as you have an object/class that follows the [Store contract](https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract), Svelte will recognise it as a store and use it to perform UI updates. 

```
If it looks like a duck, swims like a duck, and quacks like a duck,
then it probably is a duck.
```

Knowing this, we can expect the Svelte echosystem to get scalable, sophisticated and performant implementations of handling complex global state. We don't even have to write a single line of Svelte code to creat it, as long as it follows the contract! 

If you want me to discuss scalable patterns for creating global state then let me know! For now, we'll keep it simple and look at some concepts that you can apply to the default stores provided by Svelte.

## 1: Split up your stores
Svelte does an amazing job at _"surgically updating the DOM when the state of your app changes"_, but it is not black magic. 

Let's say you have a store with the following setup:

```ts
{
    darkmode: true,
    idle: false,
    authenticated: false,
    admin: false,
}
```

You might think that doing something like this...

```svelte
<script>
import { store } from './global-store'

onMount(() => {
    $store.darkmode = true;
})
</script>
```

...would only trigger updates on components listening to the `darkmode` property, but the truth is that there is no way for Svelte to know if the `darkmode` property or `authenticated` property was updated. This becomes easier to grasp if you look at how Svelte performs this update "under the hood" (with the normal API):

```ts
store.update(s => {
    s.darkmode = true; // Mutate object
    return s; // Return updated version of object
})
```

Notice that the whole object is returned, so Svelte can only know that "something in this store was updated". All components that subcribe to the store must therefore be checked to determine if any of their state has been changed.

The first performance tip is therefore to split up your stores into smaller stores, keeping only data that is often used together in the same store:

```ts
// store 1
{
    darkmode: true
}

// store 2
{
    idle: true
}

// store 3
{
    authenticated: false,
    admin: false
}
```

With this setup, updating the `darkmode` property will only trigger an update on components that subscribe to this store.

## 2: Use derived stores

Let's say that you have a checkout cart with multiple items, and you want to change the appearance of the cart-icon depending on the state of the checkout list.

```svelte
<script>
import { cart } from './checkout-store'

$: isEmpty = cart.length === 0
</script>

<a href="/checkout" style:background={isEmpty ? 'gray' : 'red'}>
    Go to checkout
</a>
```

There's nothing wrong with this implementation, but we can do better! Reactive variables are always be recomputed when data it depends on is updated. So because of this, the `isEmpty` variable will be recomputed if:

1. User adds a first item
2. User adds a second item
3. User adds a third item
4. User removes the third item

Notice that 3 out of the 4 recomputations are unnecessary for our use case, because we only want to know if the cart is empty or not! This is where derived stores come into the picture. A store will only trigger an update if the previous and new value are [unequal](https://github.com/sveltejs/svelte/blob/7630a25db54f113102ea6d69b7d3e13e82b278fb/src/runtime/internal/utils.ts#L39), which means that if the value updates from `false` to `false`, nothing happens.

So the following setup will trigger 75% less updates in the same scenario:

```svelte
<script>
import { derived } from 'svelte/store'
import { cart } from './checkout-store'

const isEmpty = derived(cart, c => c.length === 0)
</script>

<a href="/checkout" style:background={$isEmpty ? 'gray' : 'red'}>
    Go to checkout
</a>
```

Note that this optimiation will in most cases only apply if the derived value is a [primitive value](https://developer.mozilla.org/en-US/docs/Glossary/Primitive), because the store does a strict equality check on the previous and new value.



## 3: Update state in batches

Svelte does the following when you update a store:

1. Run the store update method
2. Set value returned from the update method as the new store value 
3. Envoke subscribers with the new store value

There's nothing wrong with this approach, but let's look at the following scenario:

You have 10 components, each listening to some global state. You ask your server for some data, and in return you get an array of 100 items. You can now do two things:

1. Loop through the array and add every item
2. Add the whole array

It might not be that clear, but the first approach will trigger 1000 updates (`10 components * 100 update calls`), while the second approach will only trigger 10 updates (`10 components * 1 update call`)

So instead of doing the following...
```ts
import { store } from './my-store'
// Triggers 1000 updates if there are 10 subscribers
listOfHundredItems.forEach(i => {
    store.update(s => [...s, i])
})
```

...you should **always do**:
```ts
import { store } from './my-store'
// Triggers 10 updates if there are 10 subscribers
store.update(s => [...s, ...listOfHundredItems])
```

If i had to only choose one optimization I'd choose this one. I worked on a issue where doing this single optimisation enhanced the performance time from 30+ seconds to around 400ms.

