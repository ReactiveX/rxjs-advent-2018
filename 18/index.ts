import { Subject } from 'rxjs';
import { distinct, distinctUntilChanged, distinctUntilKeyChanged } from 'rxjs/operators';
/*
const num$ = new Subject<number>();

num$
  .pipe(distinctUntilChanged())
  .subscribe({ next: item => console.log(`Distinct Item: ${item}`) });

num$.next(1);
num$.next(1);
num$.next(2);
num$.next(1);
num$.next(2);
num$.next(2);

*/

interface Person { name: string }

const person$ = new Subject<Person>();

person$
  .pipe(distinctUntilKeyChanged('name'))
  .subscribe({ next: item => console.log(`Distinct Item: ${item.name}`) });

person$.next({ name: 'Bob' });
// Distinct Item: Bob
person$.next({ name: 'Bob' });
person$.next({ name: 'Mary' });
// Distinct Item: Mary
person$.next({ name: 'Mary' });
person$.next({ name: 'Frank' });
