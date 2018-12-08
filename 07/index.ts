import { 
  from,
  of,
  merge
} from 'rxjs';
import { 
  filter,
  map 
} from 'rxjs/operators';

const obs$ = of('foo', 'foobar', 'foobarbaz');
const piped$ = obs$.pipe(
  map(x => x.length),
  filter(x => { throw new Error(); }),
);

piped$
  .subscribe({
    next: x => console.log(`Next: ${x}`),
    error: err => console.log(`Next: ${err}`)
  });