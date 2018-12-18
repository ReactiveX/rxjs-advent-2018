# Day 17 - Getting only the latest data

In the [previous entry](../16/readme.md), we covered both `concatMap` and `mergeMap`, how we compose together operations such as querying Wikipedia with queries coming from events.  This is the start of an autosuggest scenario where we want to give the user some suggestions when they are typing, giving them an idea of what results they can expect.

Making sure the user has the right data is key in the autosuggest scenario.  As we've discovered, `mergeMap` allows us to query an external source, but unlike `concatMap`, the order of the results isn't guaranteed.  For example, I could query for "react", and then "reactive", there is no guarantee that "reactive" comes back last, thus confusing the user.  To get around this issue, what if we could cancel the previous request and ensure that we do indeed have the latest value?  That's where the `switchMap` operator comes into play.

Let's review of where we were with our autocomplete scenario from before with using `mergeMap`, searching Wikipedia with our terms from our `EventEmitter` and its `data` event.

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

eventEmitter.emit('data', 'reacti');
eventEmitter.emit('data', 'reactive');
eventEmitter.emit('data', 'react');
// First match Reactive oxygen species
// First match Reactive
// First match React
```

As you may notice, we have our results out of order.  In an autosuggest scenario, the last thing you'd want to do is update the user with old data, so we need to cancel the previous request.  We can do that with the `switchMap`, which unsubscribes from the previous Observable and tears down the logic, for example, cancelling a `fetch` API call.

```typescript
import { fromEvent } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
  switchMap(searchWikipedia)
);

result$.subscribe({
  next: item => console.log(`First match ${item[0]}`)
});

eventEmitter.emit('data', 'reacti');
eventEmitter.emit('data', 'reactive');
eventEmitter.emit('data', 'react');
// First match React
```

Now, what you'll notice is that we're not getting three responses back, and instead only one, that with our query of `react` returned `React`, which is exaclty what we need.  We can further enhance this scenario with the events to make them less noisy such as debouncing the user input, and ensuring we're only querying when the data has in fact changed.  We'll talk about that in the next post!  Stay tuned!