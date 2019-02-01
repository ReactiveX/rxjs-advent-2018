# Day 22 - You're Hot and You're Cold

In the [previous entry](../21/readme.md), we covered pretty much an extensive look into error handling.  Today, we're going to go off on a different tangent and revisit [Day 11](../11/readme.md) which talked about Subjects, but this time coming at it from the perspective of hot and cold Observables.  Let's go through some definitions here in this post.

## Cold Observables

To be a cold Observable, it must have the following two properties:

1. The Observable does not emit values until a subscriber subscribes
2. If we have more than one subscriber, then the Observable will emit all values to all subscribers one by one.

In other words, cold observables are unicast observables, one producer to one consumer.  To illustrate this concept in action, let's look at some code.

```typescript
import { Observable } from 'rxjs';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const subcription1 = cold$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = cold$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});
```

Running this through, we get the following which shows that subscription 1, gets its own values and then finished, followed by subscription 2 with its values.  You'll notice that each time a new subscriber comes in, they get a fresh set of data.

```bash
$ npx ts-node 22/index.ts
Observable next: 42
Subscription 1: 42
Observable next: 56
Subscription 1: 56
Observable next: 42
Subscription 2: 42
Observable next: 56
Subscription 2: 56
```

What if we wanted to share the data instead of having to produce it again and again?  In that case, we have a mechanism or rather several to turn it on its head to make it a "Hot Observable"

## Hot Observables

Let's contrast this with Hot Observables, or call it multicasted Observables, where it has the following properties:

1. Observables do not wait for any subscription, as the data starts emitting when it was created.
2. They don't emit the sequence of items again for any new subscriber.
3. When a new item is emitted by a hot observable, all subscribed observers will get the emitted item all at once.

We can show what a hot observable is by either creating a `Subject`, or another example would be using a `ConnectableObservable`.  This `ConnectableObservable` allows us to take the multicasted observable and have our subscribers subscribe, and once they are done, we can then call `.connect()`.  In this example, we will use `publish()`, which behind the scenes, is a variant of the `multicast` operator using a `Subject`, which we will be talking about later.

```typescript
import { Observable, ConnectableObservable } from 'rxjs';
import { publish } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const hot$ = cold$.pipe(publish()) as ConnectableObservable<number>;

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});

hot$.connect();
```

If you leave off the `.connect()`, you won't see any data flowing through, and it's only when you call the method does the data start flowing to all recipients.

```bash
$ npx ts-node 22/index.ts
Observable next: 42
Subscription 1: 42
Subscription 2: 42
Observable next: 56
Subscription 1: 56
Subscription 2: 56
```

At the time of `.connect()`, even if you don't have any subscribers attached, the data will still flow as seen below with this example.

```typescript
import { Observable, ConnectableObservable } from 'rxjs';
import { publish } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const hot$ = cold$.pipe(publish()) as ConnectableObservable<number>;
hot$.connect();
```

Running this through will show that the data still flows despite nobody listening to it.

```bash
$ npx ts-node 22/index.ts
Observable next: 42
Observable next: 56
```

Our `ConnectableObservable` has another way of determining when subscriptions are made outside of the manual `connect()` method, amd that's via the `refCount` method.  This method takes care of determining when subscriptions are made, maintaining a reference count of them, and cools the observable so it doesn't flow.  When a subscription is made, the reference count is incremented.  If the prior reference count was zero, then the underlying Subject is subscribed and data starts flowing, thus making the Observable hot again.  And when the subscription is disposed, and the reference count drops to zero, the underlying Subject is unsubscribed from the source.  This is the most used operator when it comes to hot observables, and is the default for such operators as `fromEvent`, `fromEventPattern` and others.

So, why would we use hot observables? There are a number of reasons why you might want to use hot observables including:

1. When we want to run a job for its side effects and don't need a subscription
2. We want to broadcast our value to all subscribers at once.
3. When we don't want to trigger the source of data again for each new subscriber.

The last one is probably the biggest point, for example, with events, not triggering adding yet another handler to the node for listening to the same event.

## Ways of Creating Hot Observables

In RxJS, we provide two ways of creating hot observables.

1. Using the `ConnectableObservable` as described above.
2. Using a `Subject`, which we covered in [Day 11](../11/readme.md)

I won't go over the whole idea of subjects here, instead, we'll talk more about `ConnectableObservable` and how you use it through the various `multicast` overloads.

### Looking at the publish operator

The first way we'll talk about is using a `Subject` to backing store for our multicasted values using the `multicast` operator.  This is done with the `publish()` operator which is just a convenience method for `multicast(() => new Subject())`.  We've already covered `publish` above so I won't go into much more detail here.

There is an overload to the `publish` method that is worth exploring.  This turns the existing Observable hot, and then you have access to it inside the selector.  You don't need to worry about ref counting or connecting, as it is all contained during that scope.  Let's go through a quick example of that.

```typescript
import { interval, merge, range, zip } from 'rxjs';
import { map, publish } from 'rxjs/operators';

const hot$ =
  zip(
    interval(1000),
    range(0, 2)
  )
  .pipe(publish(multicasted$ => {
    return merge(
      multicasted$.pipe(map(x => `stream1: ${x}`)),
      multicasted$.pipe(map(x => `stream2: ${x}`)),
      multicasted$.pipe(map(x => `stream3: ${x}`))
    );
  }));

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});
```

Running this latest code, we get the following results where we merged the inner results without having to do any `connect` or `refCount`.

```bash
$ npx ts-node 22/index.ts
Subscription 1: stream1: 0,0
Subscription 1: stream2: 0,0
Subscription 1: stream3: 0,0
Subscription 2: stream1: 0,0
Subscription 2: stream2: 0,0
Subscription 2: stream3: 0,0
Subscription 1: stream1: 1,1
Subscription 1: stream2: 1,1
Subscription 1: stream3: 1,1
Subscription 2: stream1: 1,1
Subscription 2: stream2: 1,1
Subscription 2: stream3: 1,1
```

### Looking at the publishBehavior operator

Another overload of the `multicast` operator is using a `BehaviorSubject` as the underlying subject is called oddly enough, `publishBehavior`.  This contrasts with the earllier `publish` which uses the `Subject`.  How this differs is that we supply an initial value to the Observable which is then emitted to the subscribers before any `next` call to the source Observable.

Let's take a look at an example, where we supply two subscribers and then call `connect`, and then we add a third subscription which should then miss the initial default value.

```typescript
import { Observable, ConnectableObservable } from 'rxjs';
import { publishBehavior } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const hot$ = cold$.pipe(publishBehavior(-1)) as ConnectableObservable<number>;

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});

hot$.connect();

const subcription3 = hot$.subscribe({
  next: item => console.log(`Subscription 3: ${item}`)
});
```

Running this example, we will indeed see the third subscription will miss the initial value of `-1` and will continue to receive the other values.

```bash
$ npx ts-node 22/index.ts
Subscription 1: -1
Subscription 2: -1
Observable next: 42
Subscription 1: 42
Subscription 2: 42
Observable next: 56
Subscription 1: 56
Subscription 2: 56
Subscription 3: 56
```

### Looking at the publishReplay operator

Another version of the publish operator uses the `ReplaySubject` where we can replay values either by the count, or by the timeframe with the `publishReplay` operator.  We'll demonstrate this operator by modifying the above sample, but replaying only the first value.  In this case once again, since the third subscription happens after the `connect()` call, therefore it misses the first value.

```typescript
import { Observable, ConnectableObservable } from 'rxjs';
import { publishReplay } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const hot$ = cold$.pipe(publishReplay(1)) as ConnectableObservable<number>;

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});

hot$.connect();

const subcription3 = hot$.subscribe({
  next: item => console.log(`Subscription 3: ${item}`)
});
```

Running this sample, we see the following output which shows that the third subscription misses the first value.

```bash
$ npx ts-node 22/index.ts
Observable next: 42
Subscription 1: 42
Subscription 2: 42
Observable next: 56
Subscription 1: 56
Subscription 2: 56
Subscription 3: 56
```

Changing the above call to `publishReplay(2)`, we'll then see that the first value was preserved for the third subscription, however, it is different in that the third subscription will be catching up with getting the first value followed immediately by the second value.

```bash
$ npx ts-node 22/index.ts
Observable next: 42
Subscription 1: 42
Subscription 2: 42
Observable next: 56
Subscription 1: 56
Subscription 2: 56
Subscription 3: 42
Subscription 3: 56
```

### Looking at the publishLast operator

Finally, let's look at the last variation of the publish operator, this time wrapping the `AsyncSubject`.  As we know from before, we don't actually get any values from our Observable until the `complete` has been fired.

```typescript
import { Observable, ConnectableObservable } from 'rxjs';
import { publishLast } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }

  observer.complete();
});

const hot$ = cold$.pipe(publishLast()) as ConnectableObservable<number>;

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});

hot$.connect();

const subcription3 = hot$.subscribe({
  next: item => console.log(`Subscription 3: ${item}`)
});
```

Running this, we can see, this only fires the last value, and doesn't matter when you connect, you should all still get the same value.

```bash
Observable next: 42
Observable next: 56
Subscription 1: 56
Subscription 2: 56
Subscription 3: 56
```

### Sharing is caring

As I stated above, it's very common to use `publish` variants and `refCount` all at the same time.  To make this easier, we have provided a number of `share*` methods which is shorthand for `publish*().refCount()` where the `*` represents the kind of publish we are doing as we did in the previous section.

Stay tuned for yet more RxJS goodness as we wrap up this series!