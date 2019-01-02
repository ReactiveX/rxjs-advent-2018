# Day 8 - Mapping, Plucking, Tapping, and Filtering

In the [previous entry](../07/readme.md), we covered how RxJS has evolved from using dot chaining to "lettable" operators, and finally how we ended up with `pipe` to chain our operators together.  Today, we're going to cover probably the two most used operators, `map` and `filter`.  One of the early goals of RxJS was to make it as easy as possible to learn, so if you knew the [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) methods such as [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce), they operate pretty much the same way as Array does, except for being a pull collection, it becomes a push collection with values over time.

## Mapping one value to another

One of the most common operations over data structure is [`map`](https://en.wikipedia.org/wiki/Map_%28higher-order_function%29) which applies to each element of a [functor](https://en.wikipedia.org/wiki/Functor), such as arrays, and returns a new instance with results in the same order.  In simple terms, a functor is just anything that supports that mapping operation such as an array, a Promise, and yes even an Observable.  In JavaScript, we have [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) which creates a new array with the projected values.  In RxJS, we give you the operator `map` in the `rxjs/operators` imports.

As we showed in the previous post, implementing `map` in JavaScript is pretty simple, for example we could have implemented `map` ourselves on an Array.  This creates a new array, filling the array with a function call on each element from the source array, and returning the new array.

```typescript
function map<T, R>(source: Array<T>, selector: (value: T, index: number) => R, thisArg?: any): Array<R> {
  const length = source.length;
  const results = new Array(length);
  for (let i = 0; i < length; i++) {
    results[i] = selector.call(thisArg, source[i], i)
  }
  
  return results;
}

map([1, 2, 3], x => x * x);
// [1, 4, 9]
```

With the advent of Iterables in ES2015, we could generalize this a bit more to apply for both `Set` and `Array` and have it lazy as well.  We can iterate over the existing structure using the [`for .. of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of) and then yielding the transformed item.

```typescript
function* map<T, R>(source: Iterable<T>, selector: (value: T, index: number) => R, thisArg?: any): Iterable<R> {
  let i = 0;
  for (let item of source) {
    yield selector.call(thisArg, item, i++);
  }
}

const mapped = map(new Set([1, 2, 3]), x => x * x);
for (let item of mapped) {
  console.log(`Next: ${item}`);
}
// [1, 4, 9]
```

Implementing this in Observables is almost as straightforward, except that we have to take care of the error case should our selector function throw an error, and forwarding the error and completion channels on through.

```typescript
function map<T, R>(selector: (value: T, index: number, thisArg?: any) => R) {
  return function mapOperator(source: Observable<T>) : Observable<R> {
    return new Observable<R>(observer => {
      let index = 0;
      return source.subscribe({
        next: x => {
          let value: any;
          try {
            value = selector.call(thisArg, x, index++);
          } catch (err) {
            observer.error(err);
            return;
          }

          observer.next(value);
        }
      }, 
      error: err => observer.error(err),
      complete: () => observer.complete()
    });
  };
}
```

Luckily we have it nice and optimized in RxJS, so you can use it by simply importing it from `rxjs/operators`.

```typescript
include { of } from 'rxjs';
include { map } from 'rxjs/operators';

const obs$ = of(1, 2, 3).pipe(
  map(x => x * x)
);

obs$.subscribe({
  next: x => console.log(`Next: ${x}`)
});

// Next: 1
// Next: 4
// Next: 9
```

## Plucking Data

With the `map` operator, we can easily project values to a new sequence.  But, what if we wanted to just pull out values from the sequence itself?  To do that, we have the `pluck` operator, which allows us to specify which properties to pull out.  As you will notice, we can specify multiple values which recursively walks the object to pluck that desired value.

```typescript
import { from } from 'rxjs';
import { pluck } from 'rxjs/operators';

const people = [
  { name: 'Kim' },
  { name: 'Bob' },
  { name: 'Joe' }
];

const person$ = from(people).pipe(pluck('name'));

const props = [
  { prop1: { prop2: 'Kim' } },
  { prop1: { prop2: 'Bob' } },
  { prop1: { prop2: 'Joe' } }
];

const data$ = from(data).pipe(pluck('prop1', 'prop2'));
```

## Tapping Data

While `map` allows us to project a value to a new sequence.  But, what if we want to cause a side effect for each item, while project the current value to a new sequence?  That's what the `tap` operator is for, which allows us to intercept not only `next` calls, but also `error` and `complete` calls as well.  This is good for when during a sequence, some side effect needs to happen, for example a progress status to be updated, while not affecting the stream itself.

```typescript
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

const val$ = of(1, 2, 3).pipe(
  tap({
    next: item => console.log(`Tapped next: ${item}`),
    complete: () => console.log('Tapped complete')
  })
);

const subscription = val$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});
// Tapped next: 1
// Next: 1
// Tapped next: 2
// Next: 2
// Tapped next: 3
// Next: 3
// Tapped complete
// Done
```

## Filtering Data

Another higher-order function that's often used is [`filter`](https://en.wikipedia.org/wiki/Filter_%28higher-order_function%29), which iterates over a given data structure, and creates a new data structure where the predicate returns true.  No magical functional programming jargon like functor required for this operator!  In JavaScript, we have it implemented for us on the Array with [`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

We could easily implement this ourselves much like we did for `map` above, iterating over the array and only including values where the predicate evaluates to true.

```typescript
function filter<T>(source: Array<T>, predicate: (value: T, index: number) => boolean, thisArg?: any) {
  let results = [];
  for (let i = 0; i < source.length; i++) {
    if (predicate.call(thisArg, source[i], i)) {
      results.push(source[i]);
    }
  }

  return results;
} 

filter([1, 2, 3], x => x % 2 === 0);
// [2]
```

Similarly, as with the above, we can implement `filter` on things that implement `[Symbol.iterator]` such as Array, Map, Set, and even generator functions.

```typescript
  let i = 0;
  for (let item of source) {
    if (predicate.call(thisArg, item, i++)) {
      yield item;
    }
  }
}

const filtered = filter(new Set([1, 2, 3]), x => x % 2 === 0);
for (let item of filtered) {
  console.log(`Next: ${item}`);
}
// [2]
```

Lastly, implementing this for Observables is pretty much as straightforward, sending values to `observer.next` only if the predicate returns true.

```typescript
function filter<T>(predicate: predicate: (value: T, index: number) => boolean, thisArg?: any) {
  return function filterOperator(source: Observable<T>): Observable<T> {
    return new Observable<T>(observer => {
      let i = 0;
      return source.subscribe({
        next: x => {
                                      function* filter<T>(source: Iterable<T>, predicate: (value: T, index: number) => bool, thisArg?: any) {
          let shouldYield = false;
          try {
            shouldYield = predicate.call(thisArg, x, i++);
          } catch (err) {
            observer.error(err);
            return;
          }

          if (shouldYield) {
            observer.next(x);
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
}
```

Luckily, just as before, we don't need to implement this ourselves, and instead it is provided by the `filter` operator in `rxjs/operators`.

```typescript
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

const obs$ = of(1, 2, 3).pipe(
  filter(x => x % 2 === 0),
  map(x => x * x)
);

obs$.subscribe({
  next: x => console.log(`Next: ${x}`)
});

// Next: 4
```

That's enough for now as we've learned how to create operators from scratch with the two most basic ones,  `map` and `filter`.  I hope this also gives you the confidence that you too could write something like RxJS. In the next posts, we'll cover more of the everyday operators you'll be using as you get more comfortable with RxJS!
