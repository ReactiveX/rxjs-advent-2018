import { combineLatest, merge, interval, of, zip } from 'rxjs';
import { map, take, withLatestFrom } from 'rxjs/operators';

/*
const num1$ = of(1, 2, 3);
const num2$ = of('foo', 'bar', 'baz');

const num$ = zip(num1$, num2$);

num$.subscribe({ next: x => console.log(`Data: ${x}`) });
*/
/*
const num1$ = interval(1000).pipe(map(x => `First: ${x}`), take(3));
const num2$ = interval(1500).pipe(map(x => `Second: ${x}`), take(3));
const num3$ = interval(500).pipe(map(x => `Third: ${x}`), take(3));

const num$ = combineLatest(num1$, num2$, num3$);
num$.subscribe({ next: x => console.log(`${x}`) });
*/

const num1$ = interval(1000).pipe(map(x => `First: ${x}`), take(3));
const num2$ = interval(1500).pipe(map(x => `Second: ${x}`), take(3));
const num3$ = interval(500).pipe(map(x => `Third: ${x}`), take(3));

const num$ = num1$.pipe(withLatestFrom(num2$, num3$));
num$.subscribe({ next: x => console.log(`${x}`) });