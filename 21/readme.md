# Day 21 - Error Handling with Observables

In the [previous entry](../20/readme.md), we covered some basic operators for skipping and taking values based upon certain criteria.  Today, we're going to go back to a fundamental concept of error handling.

## Sometimes errors happen

One of the key concepts of the Reactive Extensions is its completion semantics.  What we're trying to accomplish is a push based version of the basic iteration loop with try/catch.  This matches perfectly with our `Observer` which has a `next`, with either an `complete` or an `error` terminating the sequence.  Here, I've mapped these methods to `handle` methods so you understand where each fits in the world.

```typescript
try {
  for (let item of source) {
    handleNext(item);
  }

  handleComplete();
} catch (err) {
  handleError(err);
}
```

When we subscribe to a given Observable, we have the option of supplying an `error` handler to our `Observer` in case an error happens.  If we do not supply an error handler, a general error will be thrown and script halted.  This is different from Promises where they will report unhandled rejections via the 'unhandledRejection' on the host.

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

const num$ = of(1, 2, 3).pipe(
  map(() => { throw new Error('woops'); })
);

num$.subscribe({
  next: item => console.log(`Next: ${item}`)
});
```

If we run this, our process will crash such as the following which will tell us where the error occurred as well as the stack trace.

```bash
$ npx ts-node 21/index.ts
rxjs-advent-2018/21/index.ts:5
  map(() => { throw new Error('woops'); })
                    ^
Error: woops
```

We can get around this by adding an error handler with the subscription where we will display the error's message.

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

const num$ = of(1, 2, 3).pipe(
  map(() => { throw new Error('woops'); })
);

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
// Error: woops
```

Keep in mind, that errors could happen at any time, and not just the first element which we're doing right now.

```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

const num$ = of(1, 2, 3).pipe(
  map(item => {
    if (item > 2) {
      throw new Error('woops');
    } else {
      return item;
    }
  })
);

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
// Next: 1
// Next: 2
// Error: woops
```

## Throwing errors

Just as we randomly threw errors in the previous examples, we could also create errors via the `throwError` factory operation.  This is useful for modeling errors when an Observable is required.  Not only that, but we can control it via a Scheduler if need be.

```typescript
import { throwError } from 'rxjs';

const num$ = throwError(new Error('woops'));

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
// Error: woops
```

## Catching errors

Just as we have the ability to throw errors via the `throwError` or just throwing errors, we can also recover from our errors via the `catchError` operator.  This allows us to inspect the current error, and return an Observable which continues the sequence.  In this case, we'll throw an error once we get past our second item and then merge in an error.  I will also include a console logging mechanism to show that an error has been thrown and caught.

```typescript
import { of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs';

const num$ = of(1, 2, 3).pipe(
  mergeMap(item => {
    if (item > 2) {
      return throwError(new Error('woops'));
    }

    return of(item * item);
  }),
  catchError(err => {
    console.log(`Error caught: ${err.message}`);
    return of(42);
  })
);

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
// Next: 1
// Next: 4
// Error caught: woops
// Next: 42
```

As you can see, our handler caught the error and then we returned a sequence of a single item of `42`.

## Resuming after an error VB Style

Just as we can catch an error via the `catchError` operator, we can also go Visual Basic Style with `onErrorResumeNext`, which is an ode to the Visual Basic [`On Error Resume Next`](https://docs.microsoft.com/en-us/dotnet/visual-basic/language-reference/statements/on-error-statement#on-error-resume-next), of which the Reactive Extensions creator, Erik Meijer, is a fan.  This allows us to continue after an error with a new Observable or set of Observables.  This will keep on going even if the last operation succeeds.

```typescript
import { of, throwError } from 'rxjs';
import { onErrorResumeNext } from 'rxjs/operators';

const num1$ = throwError(new Error('first'));
const num2$ = throwError(new Error('second'));
const num3$ = of(42);
const num4$ = of(56);

const num$ = num1$.pipe(
  onErrorResumeNext(num2$, num3$)
);

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
// Next: 42
// Next: 56
```

## Finalizing an operation

So far we've covered the `try/catch` aspect of Observables, but not the `finally` part just yet.  We have the ability to, at the end of the sequence, we can invoke some action.  This is useful if we have some resources open and we want to ensure that they are closed, regardless of whether an error has occurred or not.

```typescript
import { of, throwError } from 'rxjs';
import { finalize } from 'rxjs/operators';

of(42).pipe(
  finalize(() => console.log('Finally called'))
).subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`),
  complete: () => console.log('Done')
});
// Next: 42
// Done
// Finally called

throwError(new Error('woops')).pipe(
  finalize(() => console.log('Finally called'))
).subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`),
  complete: () => console.log('Done')
});
// Error: woops
// Finally called
```

As you'll notice, the `finalize` operation happens after the `complete` handler is called.

## Retrying an operation

Operations can fail such as with an HTTP request or some other network connection issue, so we need a way to retry operations, such as try three times and then give up if it doesn't work.  We accomodate this feature via the `retry` operator which specifies the number of retries before the operation gives up and thus letting the error through.  Note if you do not specify a retry count, then it will retry indefinitely.

```typescript
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

let retryCount = 0;
const obs$ = new Observable<number>(observer => {
  if (++retryCount == 2) {
    observer.next(42);
    observer.complete();
  } else {
    observer.error(new Error('woops'));
  }
});

const nums$ = obs$.pipe(retry(3));

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
// Next: 42
```

## Conditionally retrying an operation

The `retry` operator is good for many things like immediately retrying an operation.  There may be instances, however, when you need finer grained control over when and how a retry happens.  For that, we have the `retryWhen` operator which allows us to create a backoff strategy, for example, using `delayWhen` to specify the delayed time for that next try.

```typescript
import { Observable, range, timer, zip } from 'rxjs';
import { delayWhen, map, retryWhen, tap } from 'rxjs/operators';

let retryCount = 0;
const obs$ = new Observable<number>(observer => {
  if (++retryCount == 3) {
    observer.next(42);
    observer.complete();
  } else {
    observer.error(new Error('woops'));
  }
});

const num$ = obs$.pipe(
  retryWhen(errors => {
    return zip(errors, range(1, 3)).pipe(
      map(([_, index]) => index),
      tap(item => console.log(`Retrying after ${item} seconds`)),
      delayWhen(item => timer(item * 1000))
    );
  })
);

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
// Retrying after 1 seconds
// Retrying after 2 seconds
// Next: 42
```

There are more advanced scenarios for error handling, but this should give you a flavor of what the art of the possible is when it comes to handling errors in your application!