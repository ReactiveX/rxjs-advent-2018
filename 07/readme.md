# Day 7 - Pipe Dreams

In the [previous entry](../06/readme.md), we talked about converting existing events to RxJS Observables.  Today, we're going to take our adventure a little bit further with chaining operations together.

## Adding operators the old fasioned way

In previous releases, RxJS would use dot-chaining for operators, meaning we would add methods such as `map`, `filter`, `scan` and others directly to the prototype so we could achieve a nice fluent API.  This had some advantages of a complete toolbox where you could easily consume new operators by adding it to the prototype.  

```typescript
var observable = Rx.Observable.range(0, 10)
  .map(x => x * x)
  .filter(x => x % 3 === 0);
```

This had many advantages at the time with a batteries included approach where you had all the operators you usually needed directly out of the box.  Unfortunately, the number of operators used in RxJS grew over time where we had to split out each operator by functionality, either by time, by join patterns, by grouping, or core.  That was a little bit of a hassle because you would get many operators you would never even use.

## Lettable Operators

Instead, we focused on an operator we already had with `let` which would allow you to compose operators in a bit of a nicer way, for example we could export `map` as a function and then compose as we wished.

```typescript
function map<T, R>(source: Observable<T>, selector: (value: T, index: number) => R) {
  return new Observable<R>(observer => {
    let index = 0;
    return source.subscribe({
      next: x => {
        let value: any;
        try {
          value = selector(x, index++);
        } catch (err) {
          observer.error(err);
          return;
        }

        observer.next(value);
      },
      error: err => observer.error(err),
      complete: () => observer.complete()      
    })
  });
}

const obs$ = Observable.range(0, 100)
  .let(o => map(o, x => x * x));
```

This was a step in the right direction, but having to project the source over yourself again and again was a bit of a pain.  What if we could abstract away the source and have that applied later? We could then write our map function as a partially applied function.

```typescript
function map<T, R>(selector: (value: T, index: number) => R) {
  return function mapOperator(source: Observable<T>) : Observable<R> {
    return new Observable<R>(observer => {
      let index = 0;
      return source.subscribe({
        next: x => {
          let value: any;
          try {
            value = selector(x, index++);
          } catch (err) {
            observer.error(err);
            return;
          }

          observer.next(value);
        }
      }, 
      error: err => observer.error(err),
      complete: () => observer.complete()
    });
  };
}

const num$ = Observable.range(0, 100)
  .let(map(x => x * x));
```

## Piping data all the way through

That looks a bit better and towards a solution we'd want for importing only the operators we want.  This style was called lettable operators.  This was changed later on to `pipe` because of the confusing name around it, like what the heck does "let" even mean?  Not only did this change a bit from allowing only a single operator, to allowing any number of operators, where we could write `pipe` easily enough over an arguments array of them.

```typescript
function pipe(...operators: Operator) {
  const ops = Array.from(operators);
  
  return function piped(input: any) {
    return ops.reduce((prev, fn) => fn(prev), input);
  }
}
```

Then we could write something like the following where we could take map and filter together and then give it an initial value.

```typescript
const pipes = pipe(
  map(x => x * x),
  filter(x => x % 3 === 0)
);

const pipe$ = pipes(range(, 100)).subscribe({
  next: x => console.log(`Next: ${x}`)
});
```

Luckily this is all done for you with there being a `Observable.prototype.pipe` which provides this method for you.  And all the operators have been rewritten in such a way to support this style by importing from `rxjs/operators`.  So now we could rewrite our above sample as easily as this with imports.

```typescript
import { range } from 'rxjs';
import {
  filter, 
  map
} from 'rxjs/operators';

const num$ = range(0, 100).pipe(
  map(x => x * x),
  filter(x => x % 3 === 0)
);

num$.subscribe({
  next: x => console.log(`Next: ${x}`)
});
```

That's enough for now, but now gets us to a nicer spot where we can tree shake, taking only the pieces of RxJS we need, such as the `map` and `filter` operator, the `range` creation method, and that's it!  Next, we'll go into some basic operators, so stay tuned!