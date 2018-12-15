import { concat, interval, merge, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

/*
const num1$ = of(1, 2);
const num2$ = of(3, 4);
const num3$ = of(5, 6);

const num$ = concat(num1$, num2$, num3$);
const subscription = num$.subscribe({
  next: item => console.log(item)
});
*/

const num1$ = interval(1000).pipe(map(x => `First: ${x}`), take(3));
const num2$ = interval(1500).pipe(map(x => `Second: ${x}`), take(3));
const num3$ = interval(500).pipe(map(x => `Third: ${x}`), take(3));

const num$ = merge(num1$, num2$, num3$, 1);
const subscription = num$.subscribe({
  next: item => console.log(item)
});