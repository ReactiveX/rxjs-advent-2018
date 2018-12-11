import { 
  AsyncSubject,
  BehaviorSubject,
  ReplaySubject, 
  Subject 
} from 'rxjs';

/*
const event$ = new Subject<string>();

event$.next('hello');

const subscription = event$.subscribe({
  next: val => console.log(`Received ${val}`)
});

event$.next('world');
*/

/*
const event$ = new ReplaySubject<string>();

event$.next('hello');

const subscription = event$.subscribe({
  next: val => console.log(`Received ${val}`)
});

event$.next('world');
*/

/*
const result$ = new AsyncSubject<string>();

result$.subscribe({
  next: val => console.log(`First subscriber: ${val}`)
});

result$.next('hello world');
result$.next('goodbye world');
result$.complete();

result$.subscribe({
  next: val => console.log(`Second subscriber: ${val}`)
});
*/
const event$ = new BehaviorSubject<string>('initial value');

console.log(`Current value: ${event$.getValue()}`);

event$.subscribe({
  next: val => console.log(`Data: ${val}`)
});

event$.next('hello world');

console.log(`Current value: ${event$.getValue()}`);

event$.next('goodbye world');

console.log(`Current value: ${event$.getValue()}`);
