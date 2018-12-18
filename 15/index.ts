import { interval, of } from 'rxjs';
import { concatAll, map, mergeAll, take } from 'rxjs/operators';

/*
const num$ = of(
  of(1, 2, 3),
  of(4, 5, 6),
  of(7, 8, 9)
);
*/

const num1$ = interval(1000).pipe(map(x => `First: ${x}`), take(3));
const num2$ = interval(1500).pipe(map(x => `Second: ${x}`), take(3));
const num3$ = interval(500).pipe(map(x => `Third: ${x}`), take(3));
const num$ = of(num1$, num2$, num3$);

const result$ = num$.pipe(mergeAll(1));

result$.subscribe({ next: item => console.log(item) });

