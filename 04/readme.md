# Day 4 - Creating delayed and polling operations

In the [previous entry](../03/readme.md), we covered some of the creation and conversion operators. We will get to the conversion ones quickly, but today I wanted to cover two quick creation operations for creating a polling mechanism in RxJS, with both `timer` and `interval`.  These are good operations for example long polling, or scheduling work items in the future.  If you want, for example, a game play loop, `interval` or `timer` can be used in this scenario.

# The timer operation

The first operation we'll look at is the `timer` operation. This has two functions really, a way of scheduling something in the future, or a way of scheduling something in the future with a recurring period.  Note that as always with creation operations, it allows for your own scheduler implementation.

```typescript
timer(initial: number, scheduler?: SchedulerLike): Observable<number>;
timer(initial: number, period: number, scheduler?: SchedulerLike): Observable<number>;
```

In this first example, we will schedule an item to occur in half a second from now.

```typescript
import {
  timer
} from 'rxjs';

// Schedule something once after half a second
const delay = 500 /* ms */; 
const poll$ = timer(delay);

poll$.subscribe({
  next: (x: number) => console.log(`Delayed by ${delay}ms item: ${x}`),
  complete: () => console.log('Delayed complete!')
});
```

Running this via `ts-node` gives us the following where it shows the first value is 0, and then it completes the stream.

```bash
$ ts-node 04/index.ts
Delayed by 500ms item: 0
Delayed complete!
```

The next example, we will schedule an item a half second from now, and then to run at one second intervals.  Note that this operation will run infinitely, so we can truncate by unsubscribing at any point, or a simple operator we'll talk about later called `take`.

```typescript
import {
  timer
} from 'rxjs';

// Schedule something once after half a second
const delay = 500 /* ms */; 
const period = 1000 /* ms */; 
const poll$ = timer(delay, period);

const subscription = poll$.subscribe({
  next: (x: number) => console.log(`Delayed by ${delay}ms item: ${x}`),
  complete: () => console.log('Delayed complete!')
});

// Unsubscribe after 4 seconds
setTimeout(() => subscription.unsubscribe(), 4000);
```

Running this gives us the following result which truncates after 4 seconds.
```bash
$ ts-node 04/index.ts
Delayed by 500ms item: 0
Delayed by 500ms item: 1
Delayed by 500ms item: 2
Delayed by 500ms item: 3
```

Instead of this magic unsubscription, we can simply use the `take` operator that we will cover later in our limiting Observables part and composed via the `pipe` operator.

```typescript
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

// Schedule something once after half a second
const delay = 500; 
const period = 1000; 
const poll$ = timer(delay, period);

poll$
  .pipe(take(4))
  .subscribe({
    next: (x: number) => console.log(`Delayed by ${delay}ms item: ${x}`),
    complete: () => console.log('Delayed complete!')
  });
```

Running this now gives us the following, and note that this sequence does terminate with a `complete` call unlike the `unsubscribe()` call we did above.
```bash
$ ts-node 04/index.ts
Delayed by 500ms item: 0
Delayed by 500ms item: 1
Delayed by 500ms item: 2
Delayed by 500ms item: 3
Delayed complete!
```

# The interval operation

The `interval` creation operation is quite straightforward to create an interval at a specified period of time. 

```typescript
interval(period: number, scheduler?: SchedulerLike): Observable<number>;
```

In fact, you could easily write `interval` just by using `timer` for example `timer(1000, 1000)` is the same as `interval(1000)`.  We can run through the same exercise as above but instead of starting at half a second, this starts at a one second delay.

```typescript
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

// Schedule something once after half a second
const period = 1000; 
const poll$ = interval(period);

poll$
  .pipe(take(4))
  .subscribe({
    next: (x: number) => console.log(`Delayed by ${period}ms item: ${x}`),
    complete: () => console.log('Delayed complete!')
  });
```

Running our example once again, we can take 4 items and then truncate the observable at that point. 

```bash
$ ts-node 04/index.ts
Delayed by 1000ms item: 0
Delayed by 1000ms item: 1
Delayed by 1000ms item: 2
Delayed by 1000ms item: 3
Delayed complete!
```

This should start to give you some ideas on the power of RxJS and the tools at your disposal to create really interesting games and other scenarios.  Stay tuned!
