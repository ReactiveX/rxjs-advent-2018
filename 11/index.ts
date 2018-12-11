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

event$.subscribe({
  next: val => console.log(`First subscriber: ${val}`)
});

event$.next('hello world');
event$.next('goodbye world');
event$.complete();

event$.subscribe({
  next: val => console.log(`Second subscriber: ${val}`)
});