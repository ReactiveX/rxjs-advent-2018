import { 
  Observable, 
  of,
  range,
  throwError,
  timer,
  zip
} from 'rxjs';

import { 
  catchError, 
  delayWhen,
  finalize, 
  map, 
  mergeMap, 
  onErrorResumeNext, 
  retry,
  retryWhen,
  tap
} from 'rxjs/operators';

/*
const num$ = of(1, 2, 3).pipe(
  map(item => { 
    if (item > 2) { 
      throw new Error('woops'); 
    } else { 
      return item; 
    } 
  })
);
*/

/*
const num$ = throwError(new Error('woops'));
*/

/*
const num$ = of(1, 2, 3).pipe(
  mergeMap(item => {
    if (item > 2) {
      return throwError(new Error('woops'));
    }

    return of(item * item);
  }),
  catchError(err => {
    console.log(`Error caught: ${err.message}`);
    return of(42);
  })
);
*/

/*
const num1$ = throwError(new Error('first'));
const num2$ = throwError(new Error('second'));
const num3$ = of(42);
const num4$ = of(56);

const num$ = num1$.pipe(
  onErrorResumeNext(num2$, num3$, num4$)
);

num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});
*/

/*
of(42).pipe(
  finalize(() => console.log('Finally called'))
).subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`),
  complete: () => console.log('Done')
});

throwError(new Error('woops')).pipe(
  finalize(() => console.log('Finally called'))
).subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`),
  complete: () => console.log('Done')
});
*/

let retryCount = 0;
const obs$ = new Observable<number>(observer => {
  if (++retryCount == 3) {
    observer.next(42);
    observer.complete();
  } else {
    observer.error(new Error('woops'));
  }
});

/*
const num$ = obs$.pipe(retry(3));
*/

const num$ = obs$.pipe(
  retryWhen(errors => {
    return zip(errors, range(1, 3)).pipe(
      map(([_, index]) => index),
      tap(item => console.log(`Retrying after ${item} seconds`)),
      delayWhen(item => timer(item * 1000))
    );
  })
);


num$.subscribe({
  next: item => console.log(`Next: ${item}`),
  error: err => console.log(`Error: ${err.message}`)
});