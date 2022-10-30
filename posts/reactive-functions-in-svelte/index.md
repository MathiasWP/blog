---
title: Reactive functions in Svelte
date: 2022-10-30
---

I am a huge fan of reactive declarations and reactive statements in Svelte, but i always felt that there was something missing. Recently I had an "aha"-moment, which made me realise something that filled this missing piece for me.

### Preface
I was a Vue developer before moving over to Svelte, so reactivity was something i was familiar with. I noticed quite early
that there was one thing Vue supported which Svelte didn't, and this was the reactivity of normal methods (not computed values) in markups.

#### In Vue, you can call a method in the markup, and the method would rerun everytime the values it used would update:

```svelte
<div id="app">
    {{ giveMeSomething() }}
</div>

<script>
export default {
  methods: {
    giveMeSomething() {
        //... some code
        return this.something
    },
  }
};
</script>
```

#### In Svelte, doing the same would not be reactive:

```svelte
<script>
function giveMeSomething() {
    //... some code
    return something
}
</script>

<div id="app">
    {giveMeSomething()}
</div>
```

To be honest, i did not really care that Svelte did not support this; Most of my use cases were covered with reactive declarations anways.

### The "aha" moment

I realisted that if the function declaration is reactive, then Svelte will redeclare the function everytime something within it changes, which makes the function rerun in the markup. Let's apply this to the code snippet above:

```svelte
<script>
$: giveMeSomething = () => {
    //... some code
    return something
}
</script>

<div id="app">
    {giveMeSomething()}
</div>
```

### The missing piece that was filled

In most cases you'll probably be better of using a reactive declaration instead of declaring a method which returns a value.
However, i found that this little trick is practical when you want the result of a reactive assignment.

#### So i can go from this:

```svelte
<script>
let value = '';
$: {
    // here be calculations
    // that does not fit on one line
    value = result
}
</script>

<div id="app">
    {value}
</div>
```

#### ...or this:

```svelte
<script>
let value = '';

$: value = applyLogic(...requiredArguments) // sending in all the values that should trigger reactivity

function applyLogic(...args) {
    // here be calculations
    // that does not fit on one line
}
</script>

<div id="app">
    {value}
</div>
```

#### To this:

```svelte
<script>
$: getValue = () => {
    // here be calculations
    // that does not fit on one line
    return result
}
</script>

<div id="app">
    {getValue()}
</div>
```

Here's another example using the reactive function in a reactive assignemtn:

```svelte
<script>
$: getFirstValue = () => {
    // here be calculations
    // that does not fit on one line
    return result
}
$: getSecondValue = () => {
    // here be calculations
    // that does not fit on one line
    return result
}

// will rerun everytime getFirstValue or getSecondValue is updated because of reactivity
$: value = getFirstValue() || getSecondValue()
</script>
<div id="app">
    {value}
</div>
```
