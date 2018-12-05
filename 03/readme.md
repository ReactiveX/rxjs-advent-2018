# Day 3 - Creating Observables the easy way!

In the [previous entry](../02/readme.md), we covered a bit more about Observable creation, but once again we were in the weeds showing how the magic is made. Now that you understand the basics, let's make it easy for you going forward.  Built into RxJS are a number of predefined ways of creating Observables such as:

Conversions:
- `bindCallback` - binds a callback to an Observable
- `bindNodeCallback` - binds a Node.js style error callback to an Observable
- `from` - converts a number of structures to an Observable such as Arrays, Promises, Observables, Iterables, etc.
- `fromArray` - converts an array
- `fromEvent`/`fromEventPattern` - converts DOM events and `EventEmitter`
- `fromIterable` - Converts a sequence which exposes the `Symbol.iterator` property 
- `fromObservable` - Converts an Observable which exposes the `Symbol.observable` property
- `fromPromise` - converts a `Promise`

Creation:
- `generate` - creates an Observable based upon a for loop behavior
- `empty` - creates an Observable that emits only a `complete`
- `interval` - creates an Observable that emits on the given time sequence
- `never` - creates an Observable that never emits a value
- `of` - creates an Observable from a list of arguments
- `range` - creates an Observable from a range of numbers
- `throwError` - creates an error Observable which throws the given error
- `timer` - creates an Observable that emits at the first time, and repeats on the period time if given

Today, we're going to talk a little bit about the creation operations since they are the easiest way to get started. 

### The of operator

The most common used way of creating Observables is via the `of` factory. This takes a number of arguments, followed by an optional Scheduler of your choosing which determines how the values are emitted.

```typescript
import {
  asapScheduler,
  of
} from 'rxjs';

// Using the default scheduler
const source1$ = of(1, 2, 3);

// Using the ASAP scheduler
const source2$ = of(4, 5, 6, asapScheduler);
```

We can then listen for the results with a nice tracer for which sequence is which:
```typescript
const observer = (id: number) => {
  return {
    next: (x: number) => console.log(`ID ${id} Next: ${x}`),
    complete: () => console.log(`ID ${id} Complete!`)
  };
}

const subscription1 = source1$.subscribe(observer(1));
const subscription2 = source2$.subscribe(observer(2));
```

Running that via `ts-node` gives us the following:
```bash
$ npx ts-node 03/index.ts
ID 1 Next: 1
ID 1 Next: 2
ID 1 Next: 3
ID 1 Complete!
ID 2 Next: 4
ID 2 Next: 5
ID 2 Next: 6
ID 2 Complete!
```

# The range operator

Another way of creating Observables is via the `range` operator which creates a sequence of numbers with a start value, a number of elements to produce, and an optional scheduler once again to control the concurrency.  You'll notice a common theme here that all creation operations take in an optional scheduler.  This is for testing purposes but also allows you to control the concurrency and where it runs.

```typescript
import {
  asapScheduler,
  range
} from 'rxjs';

// Without a scheduler
const number1$ = range(0, 3);

// With the asap scheduler
const number2$ = range(3, 3, asapScheduler);
```

Using the above subscription techniques to track which one we're listening to, let's run through the values.

```bash
$ npx ts-node 03/index.ts
ID 1 Next: 0
ID 1 Next: 1
ID 1 Next: 2
ID 1 Complete!
ID 2 Next: 3
ID 2 Next: 4
ID 2 Next: 5
ID 2 Complete!
```

# The generate operator

Finally, let's cover one last creation operation, the `generate` function. This acts as your standard for loop like this:
```typescript
for (let i = 0; /* initial value */
     i < 10;    /* condition */
     i++        /* increment */) {
  // Do something with the i value
}
```

In the same way, our `generate` function acts the same way with the following arguments:
```typescript
generate<Source, Result>(
  initialValue: Source,
  condition: (value: Source) => bool
  iterate: (value: Source) => Source,
  resultSelector: (value: Source) => Result
);
```

Using this knowledge, we can easily emit three values such as:
```typescript
import {
  generate
} from 'rxjs';

const number$ = generate(
  43,
  i => i < 46,
  i => i + 1,
  i => String.fromCharCode(i)
);

const subscription =  number$.subscribe({
    next: x => console.log(`Next: ${x}`),
    complete: () => console.log(`Complete!`)
  });
```

Running our solution now will look like this where we transformed our numbers into characters based upon their character code:
```bash
$ npx ts-node 03/index.ts
Next: +
Next: ,
Next: -
Complete!
```

Stay tuned to tomorrow's session where we'll cover more about creation, such as values over time and conversions!
