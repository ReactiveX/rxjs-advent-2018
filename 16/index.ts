import { from, fromEvent, of } from 'rxjs';
import { concatMap, delay, map, mergeMap } from 'rxjs/operators';
import axios from 'axios';
import { EventEmitter } from 'events';

/*
const num$ = of(1, 2, 3).pipe(
  concatMap(item => of(item).pipe(
    delay(item * 1000),
    map(item => `Item ${item} delayed by ${item * 1000} ms`)
  ))
);

const subscription = num$.subscribe({
  next: item => console.log(item)
});
*/

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