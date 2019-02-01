import { interval, range, zip } from 'rxjs';
import { skip, skipLast, skipWhile, take, takeLast, takeWhile } from 'rxjs/operators';

/*
const num$ = interval(500).pipe(
  take(3)
);
*/
/*
const num$ = interval(500).pipe(
  takeWhile((item, index) => index < 4)
);
*/

const num$ = range(0, 5);
const pair$ = zip(num$, num$.pipe(skip(1)));

/*
const num$ = range(0, 10).pipe(skipLast(8));
*/

/*
const num$ = range(0, 10).pipe(
  skipWhile((item, index) => index < 7)
);
*/

const subscription = pair$.subscribe({
  next: item => console.log(`Next: ${item}`),
  complete: () => console.log('Done')
});