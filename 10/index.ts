import { empty, of } from 'rxjs';
import { startWith, endWith, defaultIfEmpty } from 'rxjs/operators';
/*
of(1, 2, 3).pipe(
  startWith(-1, 0),
  endWith(4, 5, 6)
)
.subscribe(x => console.log(x));
*/

empty().pipe(
  defaultIfEmpty(42),
  startWith(0, 1),
  endWith(4, 5, 6)
)
.subscribe(x => console.log(x));

