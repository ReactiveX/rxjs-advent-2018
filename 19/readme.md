# Day 19 - Throttling and Debouncing Observables

In the [previous entry](../18/readme.md), we talked about taming user input via the `distinct` and `distinctUntilChanged` operators.  Today, we're going to look at another aspect of taming user input, this time with `throttle` and `debounce`.

## What's the Difference

There's a fundamental difference between `throttle` and `debounce`, although the words are similar in nature.

Throttle
> The throttle operation enforces a maximum number of times a function can be called over time.  For example, an HTTP request can be made at most once every 500 milliseconds.

Debounce
> The debounce operation enforces that a function is not called again until a certain amount of time has passed without it being called.  For example, make an HTTP request if only 500 milliseconds have passed without it being called.

## Throttle

Now that we have the basic understanding of what `throttle` is versus `debounce`, let's look at a sample implementation of it in JavaScript.  First we'll need to determine when the function was called.  Then we'll return the throttled function which takes the current time and checks if it's within the time constraint.  If it is still within the window, the function exits without invoking the function.  Otherwise, the last time the function is invoked is updated and finally the function is invoked.

```typescript
function throttle(delay: number, fn: Function) {
  let lastCall = 0;
  return function throttledFunction(...args: any[]) {
    const now = +new Date();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

import { EventEmitter } from 'events';

const emitter = new EventEmitter();

const dataHandler = (arg: string) => console.log(`Next: ${arg}`);
const throttledHandler = throttle(500, dataHandler);

emitter.addListener('data', throttledHandler);
```

In RxJS, we have two ways of dealing with throttling behavior, either by throttling by time in `throttleTime`, or by throttling by another Observable via `throttle`.  We can model our example above using RxJS the very same way.

```typescript
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

const event$ = fromEvent(emitter, 'data')
  .pipe(throttleTime(500));

const subscription = event$.subscribe({
  next: item => console.log(`Next: ${item}`)
});

emitter.emit('data', 'foo');
// Next: foo
emitter.emit('data', 'bar');
emitter.emit('data', 'baz');
```

We also have the opportunity to put in any Observable we wish as the throttling agent, for example, it could use the `interval` operator, or even our own custom `Subject` by using the `throttle` operator.

```typescript
import { fromEvent, Subject } from 'rxjs';
import { throttle } from 'rxjs/operators';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

const throttle$ = new Subject<any>();

const event$ = fromEvent(emitter, 'data')
  .pipe(throttle(() => throttle$));

const subscription = event$.subscribe({
  next: item => console.log(`Next: ${item}`)
});

// At some point fire a next for the throttler
throttle$.next();
```

Now that we understand the basics of throttling, let's dive into debouncing data.

## Debounce

In order to fully understand debounce, let's look at what a sample implementation might look like in JavaScript for `debounce`.  In essence, we are turning any given function into an asynchronous call via `setTimeout` to ensure we call the function later if no other input has come in.  So, we can take the `EventEmitter` example we have above and debounce it in a way that it will emit if no other events come within half a second.

```typescript
function debounce(delay: number, fn: Function) {
  let timerId: NodeJS.Timeout;
  return function debounceFunction(...args: any[]) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  }
}

import { EventEmitter } from 'events';

const emitter = new EventEmitter();

const dataHandler = (arg: string) => console.log(`Next: ${arg}`);
const debounceHandler = debounce(500, dataHandler);

emitter.addListener('data', debounceHandler);

emitter.emit('data', 'foobarbaz');
```

Just like with `throttle`, we have two ways of dealing with debouncing behavior, `debounceTime`, which allows you to set a relative time for debouncing, and `debounce` which allows you to put in any selector which returns an Observable.

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

const event$ = fromEvent(emitter, 'data')
  .pipe(debounceTime(500));

const subscription = event$.subscribe({
  next: item => console.log(`Next: ${item}`)
});

emitter.emit('data', 'foo');
emitter.emit('data', 'bar');
emitter.emit('data', 'baz');
// Next: baz
```

We also have the opportunity to put in any Observable we wish as the debouncing agent, for example, it could use the `interval` operator, or even our own custom `Subject` by using the `debounce` operator.

```typescript
import { fromEvent, interval } from 'rxjs';
import { throttle } from 'rxjs/operators';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();

const event$ = fromEvent(emitter, 'data')
  .pipe(throttle(() => interval(500)));

const subscription = event$.subscribe({
  next: item => console.log(`Next: ${item}`)
});
```

## Putting it all together

Now that we have an understanding of `distinctUtilChanged` and `debounceTime` to tame our user input and `switchMap` to ensure we get our proper order of results, we could write our autosuggest example like this.

```typescript
import { fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap
} from 'rxjs/operators';

const value$ = fromEvent(document.querySelector('#input'), 'keyup').pipe(
  map(e => e.target.value),
  debounceTime(500),
  distinctUntilChanged()
);

const result$ = value$.pipe(
  switchMap(queryWikipedia)
);

const subscription = result$.subscribe({
  next: items => console.log(`Results: ${items}`)
});
```

Now we have a basic understanding of taming user input, combining sequences, and more!  Stay tuned for much more in our journey of discovering RxJS!