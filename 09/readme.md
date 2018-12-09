# Aggregating via reduce and scan

In the [previous entry](../08/readme.md), we covered the basic operators that we would find on `Array` like `map` and `filter` are also there in for Observables and act pretty much the same way!  There's another common operator, `reduce` that takes a value and aggregates it by folding over the data until it gets to a single value.  This `reduce` method is two forms, one that provides an initial seed value for the accumulator, and another that doesn't.  We could implement this for Iterables like Arrays pretty easily such as the following code, accounting for both a seed value and no seed value.  If there is no seed value and the iterable is empty, then we throw an error because we cannot determine what the end value might be.

```typescript
function reduce<T, R>(source: Iterable<T>, accumulator: (acc: R, value: T, index: number) => R), seed?: R): R {
  const hasSeed = seed.length === 1;
  let i = 0,
    hasValue = false,
    acc = seed[0] as T | R;
  for (let item of source) {
    if (hasValue || (hasValue = hasSeed)) {
      acc = accumulator(<R>acc, item, i++);
    } else {
      acc = item;
      hasValue = true;
      i++;
    }
  }

  if (!(hasSeed || hasValue)) {
    throw new Error('Sequence contains no elements');
  }

  return acc as R;
}

const sum = reduce([1, 2, 3], (acc, current) => acc + current, 0);
// 6
```

With RxJS, for composition purposes, we do not reduce to a single value such as a `Promise` but instead reduce it to an Observable with a single value.  Optionally, we could do away with the whole throwing an error on empty observables and instead return an empty Observable.

```typescript
import { Observable } from 'rxjs';

function reduce<T, R>(accumulator: (acc: R, value: T, index: number) => R), seed?: R): Observable<R> {
  const hasSeed = arguments.length === 2;
  return function reduceOperator(source: Observable<T>): Observable<R> {
    return new Observable<R>(observer => {
      let hasValue = false,
        acc = seed as T | R;
      
      return source.subscribe({
        next: item => {
          if (hasValue || (hasValue = hasSeed)) {
            acc = accumulator(<R>acc, item);
          } else {
            acc = item;
            hasValue = true;
          }
        },
        error: err => observer.error(err),
        complete: () => {
          if (!(hasSeed || hasValue)) {
            observer.complete();
            return;
          }

          observer.next(acc as R);
          observer.complete();
        }
      })
    });
  };
}
```

Much as before, we have `reduce` already implemented for us in `rxjs/operators` so none of this is required, but it's good to know how the sausage is made sometimes.

```typescript
import { of } from 'rxjs';
import { reduce } from 'rxjs/operators';

const num$ = of(1, 2, 3).pipe(
  reduce((acc, x) => acc + x, 0);
);

num$.subscribe({
  next: x => console.log(`Next: ${x}`)
});
// Next: 6
```

Aggregations such as `reduce` and others aren't super useful as the sequence must have some sort of termination in order to work.  Many Observables such as mouse movements don't necessarily end as they can be infinite streams, so what good is having `reduce`?  Well, what if we told you there was such a thing as `scan` which does incremental emitting of data as it accumulates data?

## Incremental accumulators via scan

As I said before, aggregate operations aren't necessarily useful especially when dealing with infinite streams of data.  Instead, what if could emit intermediate values as part of the accumulation?  A useful example of this would be counting mouse clicks, where our `scan` operator is basically a state machine.  We could implement this for Iterables just as we did for reduce above.

```typescript
function scan<T, R>(source: Iterable<T>, accumulator: (acc: R, current, T) => R, seed?: R) {
  let hasValue = false,
    acc = this._seed;
  for (let item of source) {
    if (hasValue || (hasValue = this._hasSeed)) {
      acc = accumulator(<R>acc, item);
      yield acc;
    } else {
      acc = item;
      hasValue = true;
    }
  }
}

scan([1, 2, 3], (acc, x) => acc + x, 0);
// 1
// 3
// 6
```

Implementing this using Observables is pretty much as straight forward as the iterables approach, and not that much different than what we did for `reduce` except that we're not caring about the completion as much in order to emit values.

```typescript
function scan<T, R>(accumulator: (acc: R, curr: T) => R, seed?: R) {
  return function scanOperator(source: Observable<T>): Observable<R> {
    const hasSeed = arguments.length === 2;
    return new Observable<R>(observer => {
      let hasValue = false,
        acc = seed as T | R;
      
      return source.subscribe({
        next: item => {
          let result: any;
          if (hasValue || (hasValue = this._hasSeed)) {
            try {
              result = accumulator(<R>seed, item);
            } catch (err) {
              observer.error(err);
              return;
            }

            seed = result;
            observer.next(result);
          } else {
            seed = item;
            observer.next(item);
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  };
}
```

Now let's look at an example where this might be useful instead of just simple addition on lists, what about counting mouse button clicks?

```typescript
import { fromEvent } from 'rxjs';
import { scan } from 'rxjs/operators';

const click$ = fromEvent(document, 'click').pipe(
  scan((acc, x) => acc + x, 0)
);

click$.subscribe({
  next: console.log(`Number of clicks so far: ${x}`)
});
```

This idea of the incremental state machine is a driving factor behind such libraries as [Redux](https://redux.js.org/) with its concept of reducers.  In fact, you could probably implement the basic concepts of Redux reducers in a single line of RxJS as seen in [this post](http://rudiyardley.com/redux-single-line-of-code-rxjs/) doing nothing more than this:
```typescript
action$
  .pipe(scan(reducer, initialState))
  .subscribe(renderer);
```

Once again, this shows how RxJS gives you many building blocks to create rich experiences, whether it's clicking mouse buttons and tracking state, to Redux style reducers, RxJS has you covered.  In the next post, we'll go deeper in other operators you'll need to know!