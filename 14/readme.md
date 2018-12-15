# Day 14 - Combining Sequences Part Deux

In the [previous entry](../13/readme.md), we covered combining Observable sequences together using `zip`, `combineLatest` and `withLatestFrom`.  Today, we'll be looking at two other ways of combining sequences, with `concat` and `merge`.

## Combining sequences with concat

The first operator we will look at today is `concat`, which is to combine the sequences, by waiting until the end before starting the next sequence.  This keeps all values in order from the sequences no matter when they were emitted.  Let's walk through an example of `concat`.  

```typescript
import { concat, of } from 'rxjs';

const num1$ = of(1, 2);
const num2$ = of(3, 4);
const num3$ = of(5, 6);

const num$ = concat(num1$, num2$, num3$);
const subscription = num$.subscribe({
  next: item => console.log(item)
});
// 1
// 2
// 3
// 4
// 5
// 6
```

As you will notice, the next sequence is triggered by the previous sequence finishing, thus putting the sequences in order.  But, we're dealing with collections over time, so when we're dealing with events such as move movements, that's not super useful, so let's do a concurrent combining of sequences.

## Combining sequences with merge

In order to do concurrent combining of sequences into a single sequence, we have the `merge` operator.  This allows us to merge any number of Observables, but also control the concurrency via adding a Scheduler, or a maximum number of concurrent sequences.

```typescript
merge(...args: Observable[]): Observable
merge(...args: Observable[], maxConcurrent: number): Observable;
merge(...args: Observable[], scheduler: SchedulerLike): Observable;
```

To make this more concrete, let's take the `interval` calls from the previous lesson, and merge them together.  Note how the sequences are combined with the third sequence firing first, followed by the first, and then the second.

```typescript
import { interval, merge } from 'rxjs';
import { map, take } from 'rxjs/operators';

const num1$ = interval(1000).pipe(map(x => `First: ${x}`), take(3));
const num2$ = interval(1500).pipe(map(x => `Second: ${x}`), take(3));
const num3$ = interval(500).pipe(map(x => `Third: ${x}`), take(3));

const num$ = merge(num1$, num2$, num3$);
const subscription = num$.subscribe({
  next: item => console.log(item)
});
// Third: 0
// First: 0
// Third: 1
// Second: 0
// Third: 2
// First: 1
// Second: 1
// First: 2
// Second: 2
```

We could control the amount of concurrency with `merge` via the last parameter.  In fact, we could turn `merge` into `concat` by setting the max concurrency at 1.

```typescript
import { interval, merge } from 'rxjs';
import { map, take } from 'rxjs/operators';

const num1$ = interval(1000).pipe(map(x => `First: ${x}`), take(3));
const num2$ = interval(1500).pipe(map(x => `Second: ${x}`), take(3));
const num3$ = interval(500).pipe(map(x => `Third: ${x}`), take(3));

const num$ = merge(num1$, num2$, num3$, 1);
const subscription = num$.subscribe({
  next: item => console.log(item)
});
// First: 0
// First: 1
// First: 2
// Second: 0
// Second: 1
// Second: 2
// Third: 0
// Third: 1
// Third: 2
```

Despite the sequences themselves being asynchronous, we didn't subscribe to the next one until the first sequence was finished.  Now that we have some of the basics down of combining sequences, we will get into the whole `mergeAll`, `concatAll`, and of course all the *Map operators like `concatMap`, `mergeMap`, `switchMap` and others.  Stay tuned!