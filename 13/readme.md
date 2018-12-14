# Day 13 - Combining Sequences Part 1

In the [previous entry](../12/readme.md), we covered Redux and the Flux architecture, and how you could implement it using nothing but RxJS!  We will at some point revisit this with, especially with async actions, but for now, let's move on to a new subject, combining sequences.  In this post, we will cover how we could combine sequences using operators like `zip`, and `combineLatest`.  

## Zipping together sequences with zip

The first operator we will look at is `zip`.  This operator takes any number of sequences, and zips them together into a new Observable containing the elements from both Observables at the same position.  We could write this easily for Iterables such as the following code where it emits values only when both sides have values, and if one side is shorter than the other, the longer side is truncated.

```typescript
function* zip<T>(source1: Iterable<T>, source2: Iterable<T>): Iterable<Array<T>> {
  let it1 = source[Symbol.iterator](), it2 = source[Symbol.iterator]();
  while (true) {
    let next1 = it1.next(), next2 = it2.next();
    if (next1.done || next2.done) {
      break;
    }

    yield [next1.value, next2.value];
  }
}

const results = zip([1, 2, 3], [4, 5, 6]);
for (let item of results) {
  console.log(item);
}
// [1, 4]
// [2, 5]
// [3, 6]
```

With Observables, we get the same semantics but with push collections instead of pull.

```typescript
import { of, zip } from 'rxjs';

const num1$ = of(1, 2, 3);
const num2$ = of(4, 5, 6);

const result$ = zip(num1$, num2$);
const subscription = result$.subscribe({
  next: item => console.log(item)
});
// [1, 4]
// [2, 5]
// [3, 6]
```

## Zipping together with combineLatest

But dealing with concurrent collections, it's not super reasonable to ensure that both collections emit values at the same time at the same index.  Instead, we have `combineLatest` which emits when both sides have a value, and as the value on any of the sequences change.  Let's walk through an example using Observables using `interval` at different times, taking 3 of each.

```typescript
import { combineLatest, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

const num1$ = interval(1000).pipe(map(item => `First ${item}`), take(3));
const num2$ = interval(1500).pipe(map(item => `Second ${item}`), take(3));
const num3$ = interval(500).pipe(map(item => `Third ${item}`), take(3));

const num$ = combineLatest(num1$, num2$, num3$);
num$.subscribe({ next: item => console.log(item) });
// [First: 0, Second: 0, Third: 1]
// [First: 0, Second: 0, Third: 2]
// [First: 1, Second: 0, Third: 2]
// [First: 1, Second: 1, Third: 2]
// [First: 2, Second: 1, Third: 2]
// [First: 2, Second: 2, Third: 2]
```

What's interesting about this approach is that by the time the first two Observables are ready to omit, the third Observable has already yielded its second value.

## Zipping with withLatestFrom

The third way of combining Observables is `withLatestFrom`, which combines the source Observable with other Observable to create an Observable whose values are calculated from the latest values of each, only when the source emits.  Let's look at how this differs from our `combineLatest` from above.

```typescript
import { interval } from 'rxjs';
import { map, take, withLatestFrom } from 'rxjs/operators';

const num1$ = interval(1000).pipe(map(item => `First ${item}`), take(3));
const num2$ = interval(1500).pipe(map(item => `Second ${item}`), take(3));
const num3$ = interval(500).pipe(map(item => `Third ${item}`), take(3));

const num$ = num1$.pipe(withLatestFrom(num2$, num3$));
num$.subscribe({ next: item => console.log(item) });
// First: 1, Second: 0, Third: 2
// First: 2, Second: 1, Third: 2
```

To explain the output here, by the time the second Observable emits its first, the source itself has moved on to second item, and the third Observable has already finished.  That's enough for today, but check back tomorrow when we work on `merge` versus `concat` and combining sequences.