import {
  asapScheduler,
  of,
  range,
  generate
} from 'rxjs';

// Using no scheduler
const source1$ = of(1, 2, 3);

// Using the ASAP scheduler
const source2$ = of(1, 2, 3, asapScheduler);

const observer = (id: number) => {
  return {
    next: (x: number) => console.log(`ID ${id} Next: ${x}`),
    complete: () => console.log(`ID ${id} Complete!`)
  };
}

// const subscription1 = source1$.subscribe(observer(1));
// const subscription2 = source2$.subscribe(observer(2));

// Using no scheduler
const range1$ = range(0, 3);

// Using the ASAP scheduler
const range2$ = range(3, 3);

// const subscription3 = range1$.subscribe(observer(1));
// const subscription4 = range2$.subscribe(observer(2));

// Create generated sequence
const number$ = generate(
  43,
  i => i < 46,
  i => i + 1,
  i => String.fromCharCode(i)
);

const subscription =  number$.subscribe({
    next: x => console.log(`Next: ${x}`),
    complete: () => console.log(`Complete!`)
  });