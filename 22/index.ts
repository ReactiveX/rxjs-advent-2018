/*
import { Observable } from 'rxjs';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const subcription1 = cold$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = cold$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});
*/

/*
import { Observable, ConnectableObservable } from 'rxjs';
import { publish } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
  observer.complete();
});

const hot$ = (cold$.pipe(publish()) as ConnectableObservable<number>).refCount();

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});
*/

/*
import { interval, merge, range, zip } from 'rxjs';
import { map, publish } from 'rxjs/operators';

const hot$ = 
  zip(
    interval(1000),
    range(0, 2)
  )
  .pipe(publish(multicasted$ => {
    return merge(
      multicasted$.pipe(map(x => `stream1: ${x}`)),
      multicasted$.pipe(map(x => `stream2: ${x}`)),
      multicasted$.pipe(map(x => `stream3: ${x}`))
    );
  }));

  const subcription1 = hot$.subscribe({
    next: item => console.log(`Subscription 1: ${item}`)
  });
  
  const subcription2 = hot$.subscribe({
    next: item => console.log(`Subscription 2: ${item}`)
  });
  */

  /*
import { Observable, ConnectableObservable } from 'rxjs';
import { publishBehavior } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const hot$ = cold$.pipe(publishBehavior(-1)) as ConnectableObservable<number>;

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});

hot$.connect();

const subcription3 = hot$.subscribe({
next: item => console.log(`Subscription 3: ${item}`)
});
*/

/*
import { Observable, ConnectableObservable } from 'rxjs';
import { publishReplay } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }
});

const hot$ = cold$.pipe(publishReplay(2)) as ConnectableObservable<number>;

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});

hot$.connect();

const subcription3 = hot$.subscribe({
next: item => console.log(`Subscription 3: ${item}`)
});
*/

import { Observable, ConnectableObservable } from 'rxjs';
import { publishLast } from 'rxjs/operators';

const cold$ = new Observable<number>(observer => {
  for (let item of [42, 56]) {
    console.log(`Observable next: ${item}`);
    observer.next(item);
  }

  observer.complete();
});

const hot$ = cold$.pipe(publishLast()) as ConnectableObservable<number>;

const subcription1 = hot$.subscribe({
  next: item => console.log(`Subscription 1: ${item}`)
});

const subcription2 = hot$.subscribe({
  next: item => console.log(`Subscription 2: ${item}`)
});

hot$.connect();

const subcription3 = hot$.subscribe({
  next: item => console.log(`Subscription 3: ${item}`)
});