# Day 18 - Getting distinct data

In the [previous entry](../17/readme.md), we explored how we can create an autosuggest scenario based upon the user input, such as coming from an event stream.  Today, we're going to look at how you can get unique data, as well as unique data until the data changes.

## Only distinct data

The first operator we're going to look at is getting distinct data via the `distinct` operator.  This allows us to get data that when compared to others is distinct.  For example, we can get distinct numbers.

```typescript
import { Subject } from 'rxjs';
import { distinct } from 'rxjs/operators';

const num$ = new Subject<number>();

num$
  .pipe(distinct())
  .subscribe({ next: item => console.log(`Distinct Item: ${item}`) });

num$.next(1);
// Distinct Item 1
num$.next(2);
// Distinct Item 2
num$.next(1);
num$.next(2);
num$.next(3);
// Distinct Item 3
```

As you'll notice, it's emitting only distinct values as they come along in our stream, getting rid of duplicates.  Now, it's not super realistic obviously to have just number data, but what if instead we allowed you to pick a key to use as the distinct selector?

```typescript
interface Person { name: string }

const person$ = new Subject<Person>();

person$
  .pipe(distinct(item => item.name))
  .subscribe({ next: item => console.log(`Distinct Item: ${item.name}`) });

person$.next({ name: 'Bob' });
// Distinct Item: Bob
person$.next({ name: 'Mary' });
// Distinct Item: Mary
person$.next({ name: 'Bob' });
person$.next({ name: 'Frank' });
// Distinct Item: Frank
```

Note that since this is collecting distinct values in an internal hash set, this could grow infinitely large in size over time.  There is an optional overload which takes an Observable, which when fires, clears the internal cache.  For example, we could specify an Observable that fires every five seconds, which clears the cache, so we have a rolling window of distinct values.

```typescript
import { Subject, interval } from 'rxjs';
import { distinct } from 'rxjs/operators';

const num$ = new Subject<number>();

num$
  .pipe(distinct(undefined, interval(5000)))
  .subscribe({ next: item => console.log(`Distinct Item: ${item}`) });
```

## Streaming distinct

Having unique values is definitely very useful in reactive programming, but what about firing only when the data changes from the previous value?  An example of this would be capturing keyboard input from a DOM element and projecting the text from the input.  The problem of course is that you could hit the arrow keys, and although the 'keyup' event is firing, our data has not in fact changed.

```typescript
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

const input$ = fromEvent(document.querySelector('#input', 'keyup'))
  .pipe(
    map(ev => ev.target.value),
    distinctUntilChanged()
  );
```

This will then filter out the unwanted noise from the keys and other items that don't actually change the value at all.  We can demonstrate that here as well with a `Subject` emitting data.

```typescript
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

const num$ = new Subject<number>();

num$
  .pipe(distinctUntilChanged())
  .subscribe({ next: item => console.log(`Distinct Item: ${item}`) });

num$.next(1);
// Distinct Item: 1
num$.next(1);
num$.next(2);
// Distinct Item: 2
num$.next(1);
// Distinct Item: 1
num$.next(2);
// Distinct Item: 2
num$.next(2);
num$.next(2);
```

You'll note from this example that we only emit when our new data is different from our previous, and not overall distinct.  We can also give a comparator function which allows us to compare the previous and the current item to see if they are equal.

```typescript
interface Person { name: string }

const person$ = new Subject<Person>();

person$
  .pipe(distinctUntilChanged((prev, curr) => prev.name === curr.name))
  .subscribe({ next: item => console.log(`Distinct Item: ${item.name}`) });

person$.next({ name: 'Bob' });
// Distinct Item: Bob
person$.next({ name: 'Bob' });
person$.next({ name: 'Mary' });
// Distinct Item: Mary
person$.next({ name: 'Mary' });
person$.next({ name: 'Frank' });
// Distinct Item: Frank
```

Finally, there is another way of comparing with a given key, for example, we could extract the 'name' from our data and use that as a comparator.

```typescript
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
// Distinct Item: Frank
```

So, this is one technique for taming user input for our autosuggest scenario.  We'll cover time based ones tomorrow, so stay tuned!
