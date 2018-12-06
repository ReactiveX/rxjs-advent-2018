import {
  from,
  asapScheduler,
  Observable
} from 'rxjs';
import { map } from 'rxjs/operators';

/*
const set = new Set<number>([1, 2, 3]);
const set$ = from(set);

const subscription = set$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log(`Complete!`)
});
*/

/*
const arrayLike = { length: 3 };
const array$ = from(arrayLike)
  .pipe(map((_, i) => i));

const subscription = array$.subscribe({
    next: x => console.log(`Next: ${x}`),
    complete: () => console.log(`Complete!`)
  });

*/

/*
const array = [1, 2, 3];
const array$ = from (array, asapScheduler);
array$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});
*/

const iterable = function* () {
  yield 1;
  yield 2;
  yield 3;
};

const iterable$ = from(iterable(), asapScheduler);
iterable$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});

/*
const promise = Promise.resolve(42);
const promise$ = from(promise);
promise$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});
*/

/*
const obs$ = new Observable<number>(observer => {
  observer.next(42);
  observer.complete();
});
obs$.subscribe({
  next: x => console.log(`Next: ${x}`),
  complete: () => console.log('Complete')
});
*/