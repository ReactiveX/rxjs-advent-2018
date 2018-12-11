# On the Subject of Subjects

In the [previous entry](../10/readme.md), we covered dealing with prepending, appending and substituting data if the stream is empty.   Before we get started with our Redux clone, I wanted to talk briefly on the subject of Subjects.  As we've talked about earlier, we have a number of concepts:

- `Observable`: The producer of data that can emit data zero to infinite times.  This has a contract of `subscribe` which takes an `Observer` to emit data to.
- `Observer`: The data sink in which to emit the `Observable` data.  This can be emitted to the `next` method zero to infinite times, optionally followed by an error via `error` or completion via `complete`.  Calling the `subscribe` method on the `Observable` with the `Observer` gives us a `Subscription`.  
- `Subscription`: Contains the teardown logic which can be composed together, for example, multiple streams can be added together, giving a subscription, that can be torn down via `unsubscribe`.

## Broaching the Subject

We also have another concept that we haven't covered yet, and that is Subjects, which is both an `Observable` and `Observer`.  This is useful in many ways for example having a custom event emitter where you can expose the `subscribe` to consumers while you push data via the `next` method calls.  There are a number of subjects that you can use, depending on the behavior that you want.  We'll first look at the plain `Subject`.

```typescript
import { Subject } from 'rxjs';

const event$ = new Subject<string>();

event$.next('hello');

const subscription = event$.subscribe({
  next: val => console.log(`Received ${val}`)
});

event$.next('world');
// Received: world
```

## Going Hot and Cold

As you'll notice from the above code, we're missing the 'hello' value that we emitted because we had not yet subscribed to the `Subject`.  This style of `Observable` or rather `Subject` is what we call a "Hot Observable", meaning it emits data whether we are listening to it or not, such as events like mouse moves, and in this case `Subject`.  In contrast, a "Cold Observable" is one that will always emit the same data no matter when you subscribe, such as operators like `from`, `of`, and others.  

## Replaying your data with ReplaySubject

We have ways around our problematic `Subject` with data loss due to subscribing late.  One way is using the `ReplaySubject`.  This does exactly what you think it might, it replays data, given the criteria of a given time window or number of items.  For example, I can specify that I only want to replay items from the past five minutes, or 500 items in the queue.  By default, the `ReplaySubject` will retain data indefinitely, so that any subscriber can get the same data no matter when they subscribe.

```typescript
import { ReplaySubject } from 'rxjs';

// Replays all data
const replayAll = new ReplaySubject<string>();

// Replays only the past 10 items
const replayCount = new ReplaySubject<string>(10);

// Replays on the past 5 minutes
const replayTime = new ReplaySubject<string>(Number.POSITIVE_INFINITY, 5 * 1000 * 60);

// Replays either on count or time
const replayTime = new ReplaySubject<string>(50, 5 * 1000 * 60);
```

So, now that we have this in place, we could easily capture the event we missed and replay it back, so no more chances of lost data!

```typescript
import { ReplaySubject } from 'rxjs';

const event$ = new ReplaySubject<string>();

event$.next('hello');

const subscription = event$.subscribe({
  next: val => console.log(`Received ${val}`)
});

event$.next('world');
// Received: hello
// Received: world
```

Much better results and we're not missing any data.  What we have to be careful of here, however, is the size of our `ReplaySubject` buffer since we're keeping all those values by default.

## Caching Data with AsyncSubject

Another style of subject is where we'll receive the result of some async computation, such as a `Promise`.  The `AsyncSubject` is a mirror for the JavaScript `Promise` as it will only resolve the data once, and then give the same value to all incoming subscribers.  You'll note that in order to finish the async computation, the `complete` must be called explicitly, and then the data is cached.

```typescript
import { AsyncSubject } from 'rxjs';

const result$ = new AsyncSubject<string>();

result$.subscribe({
  next: val => console.log(`First subscriber: ${val}`)
});

result$.next('hello world');
result$.complete();

result$.subscribe({
  next: val => console.log(`Second subscriber: ${val}`)
});
// First subscriber: hello world
// Second subscriber: hello world
```

You could hypothetically keep emitting values and then finally call `complete` and only the last value will be kept.

```typescript
import { AsyncSubject } from 'rxjs';

const result$ = new AsyncSubject<string>();

result$.subscribe({
  next: val => console.log(`First subscriber: ${val}`)
});

result$.next('hello world');
result$.next('goodbye world');
result$.complete();

result$.subscribe({
  next: val => console.log(`Second subscriber: ${val}`)
});
// First subscriber: goodbye world
// Second subscriber: goodbye world
```

There are many uses for the `AsyncSubject` where it caches the data.  There are downsides of this one of course as you can't retry a failed `AsyncSubject` as you can with a normal `Observable`.  That's for another discussion on error handling.

## State Machines with BehaviorSubject

The last subject is one of the most used types of subjects, called the `BehaviorSubject`.  This subject takes an initial value, such as the initial state of a state machine, such as a shopping cart or whatever you're trying to model.  

```typescript
import { BehaviorSubject } from 'rxjs';

const event$ = new BehaviorSubject<string>('initial value');

event$.subscribe({
  next: val => console.log(`Data: ${val}`)
});

event$.next('hello world');
event$.next('goodbye world');

// Data: initial value
// Data: hello world
// Data: goodbye world
```

What makes the `BehaviorSubject` even more interesting is that you can peek at its current value via the `getValue()` method call.

```typescript
import { BehaviorSubject } from 'rxjs';

const event$ = new BehaviorSubject<string>('initial value');

console.log(`Current value: ${event$.getValue()}`);

event$.subscribe({
  next: val => console.log(`Data: ${val}`)
});

event$.next('hello world');

console.log(`Current value: ${event$.getValue()}`);

event$.next('goodbye world');

console.log(`Current value: ${event$.getValue()}`);
// Current value: initial value
// Data: initial value
// Data: hello world
// Current value: hello world
// Data: goodbye world
// Current value: goodbye world
```

I hope this gives you a clear understanding of Subjects and why you might use each.  This will serve as a basis for creating a Redux clone going forward, stay tuned!