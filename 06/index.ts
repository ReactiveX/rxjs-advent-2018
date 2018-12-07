import { EventEmitter } from 'events';
import { 
  empty,
  fromEvent, 
  fromEventPattern, 
  merge,
  never,
  throwError
} from 'rxjs';
import {
  mergeMap
} from 'rxjs/operators';

const emitter1 = new EventEmitter();

const emitter1$ = fromEvent(emitter1, 'data');

emitter1.emit('data', 'hello world');

/*
const subscription1 = emitter1$.subscribe({
  next: x => console.log(`Data: ${x}`)
});

for (let i of ['foo', 'bar', 'baz', 'quux']) {
  emitter1.emit('data', i);
}

subscription1.unsubscribe();
*/

const emitter = new EventEmitter();
const data$ = fromEvent(emitter, 'data');

const error$ = fromEvent(emitter, 'error')
  .pipe(mergeMap(err => throwError(err)));

const merged$ = merge(data$, error$);

merged$.subscribe({
  next: x => console.log(`Data: ${x}`),
  error: x => console.log(`Error: ${x}`)
});

/*
for (let i of ['foo', 'bar', 'baz', 'quux']) {
  emitter.emit('data', i);
}
emitter.emit('error', new Error('woops'));
*/
emitter.emit('data', 'foo');
emitter.emit('error', new Error('woops'));
emitter.emit('data', 'bar');

/* 
const emitter3 = new EventEmitter();
const emitter3$ = fromEventPattern(
  h => { console.log('Added handler'); emitter3.addListener('data', h as (...args: any[]) => void); },
  h => { console.log('removed handler'); emitter3.removeListener('data', h as (...args: any[]) => void); }
);

const subscription3 = emitter3$.subscribe({
  next: x => console.log(`Data: ${x}`)
});

for (let i of ['foo', 'bar', 'baz', 'quux']) {
  emitter3.emit('data', i);
}

subscription3.unsubscribe();

*/