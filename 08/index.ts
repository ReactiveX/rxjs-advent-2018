import { of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

function mapArr<T, R>(source: Array<T>, selector: (value: T, index: number) => R, thisArg?: any): Array<R> {
  const length = source.length;
  const results = new Array(length);
  for (let i = 0; i < length; i++) {
    results[i] = selector.call(thisArg, source[i], i)
  }
  
  return results;
}

mapArr([1, 2, 3], x => x * x).forEach(x => console.log(`Next: ${x}`));

function* mapIter<T, R>(source: Iterable<T>, selector: (value: T, index: number) => R, thisArg?: any): Iterable<R> {
  let i = 0;
  for (let item of source) {
    yield selector.call(item, i++);
  }
}

const mapped = mapIter(new Set([1, 2, 3]), x => x * x);
for (let item of mapped) {
  console.log(`Next: ${item}`);
}

const obs$ = of(1, 2, 3).pipe(
  map(x => x * x)
);

obs$.subscribe({
  next: x => console.log(`Next: ${x}`)
});

// Filter
function filterArr<T>(source: Array<T>, predicate: (value: T, index: number) => boolean, thisArg?: any) {
  let results = [];
  for (let i = 0; i < source.length; i++) {
    if (predicate.call(thisArg, source[i], i)) {
      results.push(source[i]);
    }
  }

  return results;
} 

filterArr([1, 2, 3], x => x % 2 === 0).forEach(x => console.log(`Next: ${x}`));

function* filterIter<T>(source: Iterable<T>, predicate: (value: T, index: number) => boolean, thisArg?: any) {
  let i = 0;
  for (let item of source) {
    if (predicate.call(thisArg, item, i++)) {
      yield item;
    }
  }
}

const filtered = filterIter(new Set([1, 2, 3]), x => x % 2 === 0);
for (let item of filtered) {
  console.log(`Next: ${item}`);
}

const obs2$ = of(1, 2, 3).pipe(
  filter(x => x % 2 === 0),
  map(x => x * x)
);

obs2$.subscribe({
  next: x => console.log(`Next: ${x}`)
});