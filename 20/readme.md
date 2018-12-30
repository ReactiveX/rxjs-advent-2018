# Day 20 - Skip and Take Observables

In the [previous entry](../19/readme.md), we talked about throttling and debouncing our Observables.  Today, we're going to go back to more fundamentals with skipping and taking values from Observables.  This is important as we think of Observables over time, the need to skip values is important, just as it is to truncate our Observables via taking.

## Taking a number of values with take

The first section we will look at is taking a number of values from our Obesrvable with the `take` operator.  This is extra useful if you have an infinite stream and only want a certain number of values.  We have shown this operator plenty in previous posts, but now it deserves a spot of its own.  This operator simply takes a number of values you want from the Observable stream, and then completes the it.

```typescript
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';

const num$ = interval(500).pipe(
  take(3)
);

const subscription = num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});
// Next: 0
// Next: 1
// Next: 2
// Done
```

As you can see, we get three values from our stream, followed by the completion, thus terminating what would have been an infinite stream.

## Taking the last values with takeLast

What if we want to only take the last number of values from a stream, such as the last five values?  To do that, we would use the `takeLast` operator.  Unlike the previous operator, `take`, this operator requires our Observable sequence to be finite in size, for example using a `range` to create data and then pluck the last values from it.

```typescript
import { range } from 'rxjs';
import { takeLast } from 'rxjs/operators';

const num$ = range(0, 10).pipe(
  takeLast(3)
);

const subscription = num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});
// Next: 7
// Next: 8
// Next: 9
// Done
```

## Taking values while a predicate holds true with takeWhile

Another variation on take is while a predicate holds true via the `takeWhile` operator.  For example, we could take values less than a certain value.  This differs from `filter` as the sequence completes once the `predicate` is no longer true.  The predicate takes in both the current value as well as the index.

```typescript
import { range } from 'rxjs';
import { takeLast } from 'rxjs/operators';

const num$ = range(0, 10).pipe(
  takeWhile((item, index) => index < 4)
);

const subscription = num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});
// Next: 0
// Next: 1
// Next: 2
// Next: 3
// Done
```

## Taking values until another Observable with takeUntil

One of the more interesting operators, especially dealing with infinite streams, is to truncate our current stream based upon another stream.  This is via the `takeUntil` method which takes in another Observable and truncates when the other fires its first `next` value.  One common scenario you see for this is drag and drop which could be described as starting with mouse down and mouse move, calculate the delta between the start and current position, taking until the mouse up happens.

```typescript
import { fromEvent } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';

const el = document.querySelector('#drag');
const mouseup$ = fromEvent(el, 'mouseup');
const mousedown$ = fromEvent(el, 'mousedown');
const mousemove$ = fromEvent(document, 'mousemove');

const mousedrag$ = mousedown$.pipe(
  mergeMap(down => {
    let startX = down.offsetX, startY = down.offsetY;

    return mousemove$.pipe(
      map(move => {
        move.preventDefault();

        return {
          left: move.clientX - startX,
          top: move.clientY - startY
        };
      }),
      takeUntil(mouseup$)
    );
  })
);
```

This is a pretty useful operator outside of this particular scenario, but it demonstrates the capability of combining two streams together until another stream interrupts it.

## Skipping a number values with skip

Just as we have a way of taking a number of values, we can also skip a number of values using the `skip` operator.  What makes this more fun is combining it with `zip` to combine a stream to get the previous and current values.

```typescript
import { range, zip } from 'rxjs';
import { skip } from 'rxjs/operators';

const num$ = range(0, 5);
const pair$ = zip(num$, num$.pipe(skip(1)));

const subscription = pair$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});
// Next: 0,1
// Next: 1,2
// Next: 2,3
// Next: 3,4
// Done
```

## Skipping the last number of values with skipLast

Just as we can take a number of items from the last of the stream with `takeLast`, we can also skip those last values using `skipLast`.  This is useful for trimming off data we don't want at the end.

```typescript
import { range } from 'rxjs';
import { skipLast } from 'rxjs/operators';

const num$ = range(0, 10).pipe(skipLast(8));

const subscription = num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});
// Next: 0
// Next: 1
// Done
```

## Skipping data while the predicate is true with skipWhile

As you'll notice a trend, if we have a take method, chances are we will have a corresponding skip method as well.  This also holds true for `takeWhile` and `skipWhile` where we will skip values until the predicate no longer holds true.  Much like before, the predicate takes the current value as well as the index and you return a boolean value whether the predicate holds or not.

```typescript
import { range } from 'rxjs';
import { skipWhile } from 'rxjs/operators';

const num$ = range(0, 10).pipe(
  skipWhile((item, index) => index < 7)
);

const subscription = num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});
// Next: 7
// Next: 8
// Next: 9
// Done
```

## Skipping until another Observable fires with skipUntil

Just like `takeUntil`, `skipUntil` allows us to skip values in our source Observable until the other Observable fires its first `next` value.  This could be useful in scenarios when you only want to listen to data when a 'open' event happens and then listen to the data on the 'data' event for example.

```typescript
import { EventEmitter } from 'events';
import { fromEvent } from 'rxjs';
import { skipUntil, takeUntil } from 'rxjs/operators';

const emitter = new EventEmitter();

const open$ = fromEvent(emitter, 'open');
const close$ = fromEvent(emitter, 'close');
const data$ = fromEvent(emitter, 'data');

const value$ = data$.pipe(
  skipUntil(open$),
  takeUntil(close$)
);
```

This gives you a brief overview of what is the art of the possible with skipping and taking data from Observable streams.  Stay tuned for more!