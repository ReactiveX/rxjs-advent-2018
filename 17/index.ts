import { fromEvent } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';
import axios from 'axios';
import { EventEmitter } from 'events';

async function searchWikipedia(term: string) {//: Promise<Array<string>> {
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
eventEmitter.emit('data', 'foo');
eventEmitter.emit('data', 'bar');