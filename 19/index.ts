import { EventEmitter } from 'events';
import { fromEvent } from 'rxjs';
import { throttleTime, debounceTime } from 'rxjs/operators';

const emitter = new EventEmitter();

function throttle(delay: number, fn: Function) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = +new Date();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

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

const event$ = fromEvent(emitter, 'data')
  .pipe(debounceTime(500));

const subscription = event$.subscribe({
  next: item => console.log(`Next: ${item}`)
});

emitter.emit('data', 'foo');
emitter.emit('data', 'bar');
emitter.emit('data', 'baz');