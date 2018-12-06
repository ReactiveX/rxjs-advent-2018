# Day 5 - Converting to Observables

In the [previous entry](../04/readme.md), we covered creating polling and timed operations via `timer` and `interval`.  Today, we're still covering Observable creation, this time, by converting existing data structures to Observables via the `from` operation.  This `from` operation matches the [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from) method which was new as of ES2015.

## Using the from operation

Pretty much everything can be turned into an Observable with RxJS using the `from` creation operation. It can convert an `Array`, an `Iterable` such as a `Generator`, `Set`, or a `Map`, a `Promise`, and even another `Observable`.  Like all other creation operations, this also takes a `SchedulerLike` object used for scheduling the operation.  By default, if not provided, the `from` operation will perform things synchronously. 

Internally, RxJS uses a number of operations to convert our incoming data such as:
- `fromArray` - converts an array
- `fromIterable` - Converts a sequence which exposes the `Symbol.iterator` property 
- `fromObservable` - Converts an Observable which exposes the `Symbol.observable` property
- `fromPromise` - converts a `Promise`

## Converting an Array to an Observable

The first conversion we can do is from an `Array` or array-like structure, meaning it has a length property.  Let's first convert using just an array.

```typescript
import { from } from 'rxjs';

const array = [1, 2, 3];
const array$ = from(array);

const subscription = array$.subscribe({
    next: x => console.log(`Next: ${x}`),
    complete: () => console.log(`Complete!`)
  });
```

Running this gives us the following results:
```bash
$ npx ts-node 05/index.ts
Next: 1
Next: 2
Next: 3
Complete
```

We can also run it with an array-like structure as well with a length property of 3.

```typescript
const arrayLike = { length: 3 };
const array$ = from(arrayLike);

array$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});
```

Running this gives particular version gives us the following results with `undefined` everywhere.

```bash
$ npx ts-node 05/index.ts
Next: undefined
Next: undefined
Next: undefined
Complete
```

Unfortunately, in later versions, the result selector function was removed from the `from` operation, but we can easily get this back via using the `map` operator which we will cover later.  The `map` operator simply takes the current value and allows you to project a new value in the stream in its place.  In this instance, we're more concerned with the index argument from the selector which will give us our unique place.

```typescript
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

const array = [1, 2, 3];
const array$ = from(array)
  .pipe(map((_, i) => i));

const subscription = array$.subscribe({
    next: x => console.log(`Next: ${x}`),
    complete: () => console.log(`Complete!`)
  });
```

Now, since we're projecting the index, we now have some data to display.
```bash
$ npx ts-node 05/index.ts
Next: 0
Next: 1
Next: 2
Complete!
```

##  Converting an Iterable to an Observable

With ES2015 came the advent of [Iterables, Iterators, and Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators).  This gave us a way to iterate over existing sequences such as arrays, but also new structures such as `Map` and `Set`.  Each of these objects now implement the `Symbol.iterator` property which returns an `Iterator` object.  This `Iterator` object has three methods which correspond directly to our `Observer` with `next()`, `throw()` and `return()` and its Observer equivalents with `next()`, `error()`, and `complete()`.  When `next()` is called on an iterator, it returns a structure with both a property of the current value, if any, and a done flag indicating whether the sequence has been iterated.  Generators also implement this `Symbol.iterator` property which allows us to create infinite sequences if we so choose.

We can for example, create an Observable from a `Set` with a few values.
```typescript
const set = new Set<number>([1, 2, 3]);
const set$ = from(set);

const subscription = set$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log(`Complete!`)
});
```

And when we run the example, we get the following output from the sequence.
```bash
$ npx ts-node 05/index.ts
Next: 1
Next: 2
Next: 3
Complete!
```

We can also create a `Generator` function which yields values as well via the `yield` keyword.

```typescript
const generatorFunction = function* () {
  yield 1;
  yield 2;
  yield 3;
};

const iterable$ = from(generatorFunction(), asapScheduler);
iterable$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});
```

And just as above, we get the results of 1, 2, 3.
```bash
$ npx ts-node 05/index.ts
Next: 1
Next: 2
Next: 3
Complete!
```

## Converting an Observable to an Observable

Another thing we can convert is an Observable to yet another Observable.  There are a number of libraries that implement the Observable contract which has the `subscribe` method, just as the `Promise` exposes the `then` method.  For example, we could take something from Redux and convert it to an RxJS Observable.  In this example, we'll just use another RxJS Observable, but it could be anything that implements the `Observable` contract.

```typescript
import { from, Observable } from 'rxjs';

const obs$ = new Observable<number>(observer => {
  observer.next(42);
  observer.complete();
});

obs$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});
```

Running this sample, we get the following output:
```bash
$ npx ts-node 05/index.ts
Next: 42
Complete!
```

## Converting a Promise to an Observable

One of the more common scenarios using `from` is converting a `Promise` to an Observable.  Many libraries now implement Promises as part of their asynchronous APIs, including Node.js, so it's only natural we give an easy way to convert that a `Promise` to an `Observable`.  

```typescript
const promise = Promise.resolve(42);
const promise$ = from(promise);

promise$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});
```

Like above with our Observable example, we get the same output of 42 and then a completion.
```bash
$ npx ts-node 05/index.ts
Next: 42
Complete!
```

That's enough for now, but stay tuned as we cover converting events to Observables!
