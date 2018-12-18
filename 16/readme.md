# Day 16 - Projecting to new sequences

In the [previous entry](../15/readme.md), we covered how we can smoosh a sequence of sequences with both `concatAll` and `mergeAll`.  In this entry, we'll explore some of the most common operators you'll encounter with projecting a value to a new sequence via `mergeMap`, and `concatMap`.  These operators, as you might think, are simply a combination of the `map` operator, which produces the Observable of Observables, and then it's up to us how we combine those sequences into a single sequence, whether concurrent or not.

The reason why these operators are important is because we need ways to compose a value from our current Observable, for example a stream of text values as you type, and then you want to take that value and query a service which is also an Observable or Promise that we'd want to flatten into a single answer.  These operators are all aptly named *Map operators, where the style of combining is the first part of the name whether it is `mergeMap`, `concatMap`, or the ever important `switchMap` which we will get into in the next post.

## Projecting a new value with concatMap

The first one we will look at is `concatMap`, which is a combination of the previous operators we've covered, `map`, and `concatAll`.  In this first example, we'll take a value from our list, and delay the value by a second times its value by using the `delay` operator and then mapping it so we have a nice value to show how long each was delayed by.  We're diving into the deeper end of composition, but I want to give the idea of the art of the possible.

```typescript
import { of } from 'rxjs';
import { concatMap, delay, map } from 'rxjs/operators';

const num$ = of(1, 2, 3).pipe(
  concatMap(item => of(item).pipe(
    delay(item * 1000),
    map(item => `Item ${item} delayed by ${item * 1000} ms`)
  ))
);

const subscription = num$.subscribe({
  next: item => console.log(item)
});
// Item 1 delayed by 1000ms
// Item 2 delayed by 2000ms
// Item 3 delayed by 3000ms
```

## Projecting a new value with mergeMap

Now that we have a basic understanding of `concatMap`, let's talk about a more concurrent approach where we can take the data as it comes in and project it to the new sequence.  For example, we could query Wikipedia with Axios using Node.js with events from an `EventEmitter`.  Remember, a `Promise` that is returned from this will be converted automatically into an Observable.

```typescript
import { fromEvent } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import axios from 'axios';
import { EventEmitter } from 'events';

async function searchWikipedia(term: string): Promise<Array<string>> {
  const response = await axios.get('http://en.wikipedia.org/w/api.php', {
    params: {
      action: 'opensearch',
      format: 'json',
      search: term
    }
  });
  return response.data[1];
}

const eventEmitter = new EventEmitter();
const value$ = fromEvent<string>(eventEmitter, 'data');

const result$ = value$.pipe(
  mergeMap(searchWikipedia)
);

result$.subscribe({
  next: item => console.log(`First match ${item[0]}`)
});

eventEmitter.emit('data', 'react');
eventEmitter.emit('data', 'reacti');
eventEmitter.emit('data', 'reactive');
// First match Reactive
// First match React
// First match Reactive oxygen species
```

We can then emit three queries at once and see the results come in.  Note of course, since this is a merge operation, the results can come in any order, unlike with `concatMap`.  So, the question is, how would we fix it so that we only get the latest and greatest query and cancel the rest?  That's for the next lesson!  Stay tuned!