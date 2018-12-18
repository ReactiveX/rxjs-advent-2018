# Day 15 - Combining Sequences of Sequences

In the [previous entry](../14/readme.md), we covered combining sequences with `concat` and `merge`.  Today we're going to dive a bit deeper into `merge` and `concat` with how we combine sequence of sequences.

## Smooshing a sequence of sequences

In the previous section, we demonstrated `concat` which took a number of sequences and smooshed them together in order.  But, what if we had a sequence of sequences, for example `Observable<Observable<number>>` that we want to smoosh into a single sequence?  We have several ways of doing that, such as we noted, whether we want concurrent or single instance at a time.  In the case of `concatAll`, it only allows one sequence at a time.

```typescript
import { of } from 'rxjs';
import { concatAll } from 'rxjs/operators';

const num1$ = of(1, 2);
const num2$ = of(3, 4);
const num3$ = of(5, 6);

const num$ = of(num1$, num2$, num3$).pipe(concatAll());

const subscription = num$.subscribe({
  next: item => console.log(item);
});
// 1
// 2
// 3
// 4
// 5
// 6
```

## Concurrent smooshes with mergeAll

As I've said before, when dealing with infinite sequences, chances are that `concatAll` isn't going to help us because it expects an end to the sequence.  For this scenario, we have `mergeAll`, where we can give it as many inner sequences as we wish.

```typescript
import { interval, of } from 'rxjs';
import { map, mergeAll, take } from 'rxjs/operators';

const num1$ = interval(1000).pipe(map(x => `First: ${x}`), take(3));
const num2$ = interval(1500).pipe(map(x => `Second: ${x}`), take(3));
const num3$ = interval(500).pipe(map(x => `Third: ${x}`), take(3));
const num$ = of(num1$, num2$, num3$);

const result$ = num$.pipe(mergeAll());

result$.subscribe({ next: item => console.log(item) });
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

In addition, we can specify the limit of concurrency for the inner sequence subscriptions.  For example, we could limit it to 1, which would be the same as `concatAll`.

```typescript
const result$ = num$.pipe(mergeAll(1));

result$.subscribe({ next: item => console.log(item) });
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

So, now we have a basic handle on smooshing and combining sequences together, so we'll take the next step to combine sequences via `mergeMap` and `concatMap`.