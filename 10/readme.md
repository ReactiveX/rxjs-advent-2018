# Day 10 - Starting with data, ending with data, and defaulting if empty

In the [previous entry](../09/readme.md), we covered aggregation operations via `reduce` and `scan`.  Today, we're going to dive deeper into some operators where you can add that initial state to your observable, as well as add anything to the end.  And in the cases where your data stream is empty, we can accommodate for that too with yet another operator.

## Starting off with startWith

The first operator we're going to look at is `startWith`, which allows us to prepend data to the beginning of an Observable sequence.  As with other operators that create things, this also takes a scheduler which allows you to control the concurrency.

```typescript
startWith<T>(...args: (Array<T> | SchedulerLike)): Observable<T>;
```

We could easily write this using this for Iterables which would show you basically how `startWith` works.

```typescript
function* startWith<T>(source: Iterable<T>, ...args: Array<T>) {
  for (let i = 0; i < args.length; i++) {
    yield args[i];
  }

  for (let item of source) {
    yield item;
  }
}

startWith([2, 3, 4], 0, 1);
// [0, 1, 2, 3, 4]
```

So, we can take an existing sequence and prepend any number of values to it.  Once again like all operators, we can implement them in terms of another, for example using `concat` and `of`.  That's the beauty of RxJS, is that it's easy to make your own custom operator just as if they were Lego blocks.

```typescript
function startWith<T>(source: Observable<T>, ...args: Array<T>) {
  return concat(of(...args), source);
}
```

Let's add some values to the beginning of this sequence!

```typescript
import { of } from 'rxjs';
import { startWith } from 'rxjs/operators';

const num$ = of(2, 3, 4).pipe(
  startWith(0, 1)
);

num$.subscribe({
  next: x => console.log(`Next: ${x}`)
});
// Next 0
// Next 1
// Next 2
// Next 3
// Next 4
```

This is useful of course if you want to seed your stream with default data, such as an initial state for mouse movements with an x and y coordinate.

## Ending our sequence with endWith

Just as we have `startWith` which allows us to prepend values to the front of the Observable, we also have `endWith` which appends values to the end of the Observable sequence.  For a while, I had resisted such an operator, given how sequences must have some sort of termination in order to add values to the end.  Would it make sense to end a stream of mouse moves with more values?  After a while, I relented, and we added `endWith` which allows us once again like `startWith` to add arbitrary values with a Scheduler.  

```typescript
endWith<T>(...args: (Array<T> | SchedulerLike)): Observable<T>;
```

We could implement this for Iterables once again to show you how it works at least for pull sequences, iterating first over our source sequence, then appending all the arguments given in the function.

```typescript
function* endWith(source: Iterable<T>, ...args: Array<T>) {
  for (let item of source) {
    yield item;
  }

  for (let i = 0; i < args.length; i++) {
    yield args[i];
  }
}
```

Like above, we could implement this in RxJS instead of building from scratch, simply implement via the following using `concat` and `of`.  

```typescript
import { concat, of } from 'rxjs';

function endWith<T>(source: Observable<T>, ...args: Array<T>) {
  return concat(source, of(...args)));
}
```

An example of adding to the end could be like the following where we add 3 and 4 to an Observable of 1 and 2.

```typescript
import { of } from 'rxjs';
import { endWith } from 'rxjs/operators';

const num$ = of(1, 2).pipe(
  endWith(3, 4)
);

num$.subscribe({
  next: x => console.log(`Next: ${x}`)
});
// Next 1
// Next 2
// Next 3
// Next 4
```

## What to do when you are empty

In some cases, our Observable stream may be empty, whether it is due to connectivity, an empty cache or so on.  In RxJS, we have a way of getting around this by allowing you to substitute a value if the sequence is empty.  This is helpful for example if you don't have any data, and instead want to return some cached data or some skeleton data.

We could implement this using Iterables just to give you an idea how this might work with Observables where we have an internal state flag which says whether it has yielded any data, and if it hasn't, then yield the default value.

```typescript
function* defaultIfEmpty<T>(source: Iterable<T>, defaultValue: T) {
  let state = 1;
  for (let item of source) {
    state = 2;
    yield item;
  }
  if (state === 1) {
    yield defaultValue;
  }  
}
```

Bringing this all together, we could take an empty sequence with a default, prepend some data to it, and then add some data to it at the end.

```typescript
empty().pipe(
  defaultIfEmpty(42),
  startWith(0, 1),
  endWith(4, 5)
)
.subscribe(x => console.log(x));
// 0
// 1
// 42
// 4
// 5
```

That's enough for now, but I hope this gives you some idea of what you can do to build operators on your own using the building blocks we have!  Next up, we'll implement our own Redux and then spend the next days spending explaining how we did it!  Stay tuned!
