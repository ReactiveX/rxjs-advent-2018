# Day 2 - Sequences over time

In the [previous day](../01/readme.md), we looked at the basics of creating Observables and the parts required such as Observers and Subscriptions. There is another aspect that is missing from the initial equation which is that Observables are push based sequences over time, noting that last part, time. RxJS was designed with the notion of virtual time and a virtual clock which means you can say when a particular action happens. This concept is introduced with the idea of Schedulers, which not only controls when a particular action happens, but also the context of an action as well. 

Let's make this a little bit more concrete. Let's say that we want to use `requestAnimationFrame` to schedule our next actions. We could usually do something like the following where we schedule an action using `requestAnimationFrame`, and as part of the teardown, we have `cancelAnimationFrame` to clean up any resources or if we want to immediately cancel the item.

```typescript
import { Observable } from 'rxjs';

const number$ = new Observable<number>(observer => {
  let id = requestAnimationFrame(() => {
    observer.next(42);
    observer.complete();
  });

  return () => cancelAnimationFrame(id);
});
```

This, of course, is a nice to have, but it's not super testable in a way we could use an abstraction like a Scheduler which would allow us to swap out `requestAnimationFrame` for a virtual time stamp for testing or historical data processing. Instead, let's look at how we could do it better.

In RxJS, we have two interfaces that are required for any emitting of data, a `Scheduler`, and a `SchedulerAction`. The scheduler schedules the unit of work called the `SchedulerAction` and returns a `Subscription` which like for our Observable, allows us to tear down the work at any point.

```typescript
export interface SchedulerLike {
  now(): number;
  schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
}

export interface SchedulerAction<T> extends Subscription {
  schedule(state?: T, delay?: number): Subscription;
}
```

Since our work is rather easy, we can skip a lot of the overhead and implement our new item like the following just using a function and not caring about any unit of work `SchedulerAction`.  RxJS has a number of built-in schedulers so we don't need to implement our own for most work we need.  

The following schedulers are available to you from RxJS:
- `animationFrameScheduler` - Schedule an async action using `requestAnimationFrame` 
- `asapScheduler` - Schedule an async action as soon as possible such as using `setImmediate`
- `asyncScheduler` - Schedule an async action using `setInterval`/`clearInterval`
- `VirtualTimeScheduler` - define your own time semantics in virtual time

```typescript
import { 
  Observable,
  SchedulerLike,
  animationFrameScheduler
} from 'rxjs';

// Polyfill requestAnimationFrame
import * as raf from 'raf';
raf.polyfill();

function once<T>(value: T, scheduler: SchedulerLike) {
  return new Observable<T>(observer => {
    return scheduler.schedule(() => {
      observer.next(value);
      observer.complete();
    });
  });
}

const subscription = once(42, animationFrameScheduler)
  .subscribe({
    next:x => console.log(`Next: ${x}`),
    complete: () => console.log(`Complete!`)
  });
```

Running this, we get the following:
```bash
$ ts-node 02/index.ts
Next: 42
Complete!
```

Since this action is async by nature, we can preempt this call by immediately calling `subscription.unsubscribe()` if you so desire.  Join us next time as we get into easier ways of creating observables rather than by hand!
