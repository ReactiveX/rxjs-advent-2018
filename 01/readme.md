# Day 1 - Creating an Observable

The first entry for our calendar is creating an Observable. 

## What is this RxJS stuff?

What is an Observable? Simply put, it is a push-based event emitter which can push 0 to infinite amounts of data.  

Next, we will create an Observer, which is a sink that an Observable push data into when you want to listen for the data in the cases of more data via `next`, and error occurred via `error`, or the stream has completed via `complete`.  

Finally, we can hook it all together with subscribing the observer to the observable.  This subscription process by calling `subscribe` on the Observable, passing in our Observer.  This returns a Subscription which contains the teardown logic required to clean up any resources created by the Observable stream.

## Walking through the code

Let's walk through the [first example](index.ts), creating an Observable.  First, we need to import RxJS, only getting the Observable that is required.

```typescript
import { Observable } from 'rxjs';
```

Creating an Observable gives you a sense of the Observable lifecycle. When you create a new Observable, you pass in an Observer which you can emit data to at any point, 0 to infinite number of times `next` can be called, followed by an optional `error` or `complete` call.  Finally, when we create our Observable, we also include any teardown logic such as clearing a timeout or interval, or cancelling an incomplete network request.

```typescript
const source$ = new Observable<number>(observer => {
  observer.next(42);
  observer.complete();

  return function teardown () { console.log('Teardown'); };
});
```

Let's go more advanced with a timer based approach using `setInterval` to emit values every second, and then the teardown will cancel via `clearInterval`.  This example will run 5 times and then complete the stream.  We return a teardown function which calls `clearInterval` on our given `id` so that we can stop the intervals.

```typescript
let n = 0;
let id = 0;

// Create an Observable from scratch
const number$ = new Observable<number>(observer => {
  id = setInterval(() => {
    // Counter to run 5 times
    if (n++ < 5) {
      observer.next(n);
    } else {
      // When finished, clear the interval and complete the stream
      observer.complete();
    }
  }, 1000);

  return () => clearInterval(id);
});
```

Next, we can create an observer or data sink to emit data values into at any point.  Remember from above, we have three choices, 0 to infinite data via `next`, and handling errors via `error` and handling completion via `complete`.  In this case, we are not worried about errors, so we will only implement `next` and `complete`.

```typescript
// Handle only the next and completion handlers
const observer = {
  next: (x: number) => {
    console.log(`Next: ${x}`);
  },
  complete: () => {
    console.log(`Complete!`);
  }
};
```

Finally, we can tie it all together, calling `subscribe` on the Observable with our Observer instance.  This will return our subscription that we can unsubscribe from at any time.  Note that since the inner observer calls `complete`, the teardown logic will happen automatically and the subscription automatically unsubscribes.

```typescript
// Subscribe to the Observable with our observer
const subscription = number$.subscribe(observer);
```

This then emits the following data:
```bash
$ npx ts-node 01/index.ts
Next: 1
Next: 2
Next: 3
Next: 4
Next: 5
Complete!
```

We can terminate this sequence early, however, since it will take 5 seconds to complete, we could cancel after 2.5 seconds.

```typescript
// Subscribe to the Observable with our observer
const subscription = number$.subscribe(observer);

// Terminate the sequence after 2.5 seconds
setTimeout(() => subscription.unsubscribe(), 2500);
```

This then changes the output to the following:
```bash
$ npx ts-node 01/index.ts
Next: 1
Next: 2
```

I hope you learned the basics as we start our journey through the advent of RxJS!
