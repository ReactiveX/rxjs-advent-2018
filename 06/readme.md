# Day 6 - Converting Events to Observables

In the [previous entry](../05/readme.md), we covered converting various data structures to Observables via the `from` operation.  Today, we'll continue on the conversion operations, this time with events, using `fromEvent` and `fromEventPattern`.

## Converting events to Observable with fromEvent

The first operation we're going to look at here is `fromEvent` which allows us to take DOM Nodes, a DOM Node List, a Node.js `EventListener`, and even jQuery objects, and transform their events into Observables.  This will attach the event during the Observable creation, and during the teardown, it will remove the event listener.

Let's make this a bit more concrete with some code.  Let's take for example a DOM Node, capturing click events from a button.
```typescript
import { fromEvent } from 'rxjs';

const element = document.querySelector('#submitButton');
const click$ = fromEvent(element, 'click');

click$.subscribe({
  next: () => console.log('Clicked');
});
```

We can also capture a DOM Node list and `fromEvent` will iterate over the items and subscribe to the `click` event for each one.
```typescript
import { fromEvent } from 'rxjs';

const elements = document.querySelectorAll('.selectButtons');
const click$ = fromEvent(element, 'click');

click$.subscribe({
  next: () => console.log('Clicked');
});
```

We also bridge to the Node.js `EventEmitter` so capturing data is pretty quick and easy!

```typescript
import { EventEmitter } from 'events';
import { fromEvent } from 'rxjs';

const emitter = new EventEmitter();
const event$ = fromEvent(emitter, 'data');

emitter.emit('data', 'foobarbaz');

event$.subscribe({
  next: x => console.log(`Data: ${x}`)
});

for (let i of ['foo', 'bar', 'baz', 'quux']) {
  emitter.emit('data', i);
}
```

What you'll notice in this example, we will completely miss the first event with the data `'foobarbaz'` because we had not yet subscribed to our Observable. This is often the cause of a lot of confusion.  One workaround for this is to add `shareReplay` which will record all data and replay to every subscriber.  We will cover the whole "share" aspect later on in this series.  Running the above sample will give us the expected output of 'foo', 'bar', 'baz' and 'quux'.
```bash
$ npx ts-node 06/index.ts
Data: foo
Data: bar
Data: baz
Data: quux
```

Let's get a little bit more advanced where we want to completely convert an `EventEmitter` to an Observable, where we can capture not only the 'data' event, but also react to the 'error' and 'close' events as well.  We would need a way to throw the error if an error happens in the 'error' event.  We can merge these two streams together using the `merge` operation which creates a single observable which encompasses all two events.

```typescript
import { EventEmitter } from 'events';
import { 
  fromEvent,
  throwError
} from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const emitter = new EventEmitter();
const data$ = fromEvent(emitter, 'data');

const error$ = fromEvent(emitter, 'error')
  .pipe(mergeMap(err => throwError(err)));

const merged$ = merge(data$, error$);
```

Now let's run this through with some data to see what happens!
```typescript
merged$.subscribe({
  next: x => console.log(`Data: ${x}`),
  error: x => console.log(`Error: ${x}`)
});

for (let i of ['foo', 'bar', 'baz', 'quux']) {
  emitter.emit('data', i);
}
emitter.emit('error', new Error('woops'));
```

And running it at the console gives the results where we capture not only the data, but an error as well.
```bash
$ npx ts-node 06/index.ts
Data: foo
Data: bar
Data: baz
Data: quux
Error: Error: woops
```

## Converting events to Observables with fromEventPattern

Sometimes, our event-based contract is not quite as straightforward as the DOM, Node.js `EventEmitter` or jQuery.  Using `fromEventPattern` you can encompass your own way of attaching and detaching handlers from your event emitter, whatever it may be.  For example, you could model if your API uses `attachEvent` and `detachEvent` as the subscription pair.

```typescript
import { fromEventPattern } from 'rxjs';

const event$ = fromEventPattern(
  h => obj.attachEvent('data', h),
  h => obj.detachEvent('data', h)
);
```

We can also encompass an API that returns a token for example for unsubscription for example an `AbortController`.  By returning it from the add handler, we can then use it in our remove handler by passing it in as the second argument.

```typescript
import { fromEventPattern } from 'rxjs';

const event$ = fromEventPattern(
  h => { return obj.registerListener('data', h); },
  (h, controller) => { controller.abort(); }
);
```

That's enough for today! Join me tomorrow for our next adventure where we're getting into the `pipe` finally!
