/*
import {
  timer
} from 'rxjs';

// Schedule something once after half a second
const delay = 500;
const poll$ = timer(delay);

poll$.subscribe({
  next: (x: number) => console.log(`Delayed by ${delay}ms item: ${x}`),
  complete: () => console.log('Delayed complete!')
});
*/

/*
import {
  timer
} from 'rxjs';

// Schedule something once after half a second
const delay = 500; 
const period = 1000; 
const poll$ = timer(delay, period);

const subscription = poll$.subscribe({
  next: (x: number) => console.log(`Delayed by ${delay}ms item: ${x}`),
  complete: () => console.log('Delayed complete!')
});

// Unsubscribe after 4 seconds
setTimeout(() => subscription.unsubscribe(), 4000);
*/

/*
import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

// Schedule something once after half a second
const delay = 500; 
const period = 1000; 
const poll$ = timer(delay, period);

poll$
  .pipe(take(4))
  .subscribe({
    next: (x: number) => console.log(`Delayed by ${delay}ms item: ${x}`),
    complete: () => console.log('Delayed complete!')
  });
  */

 import { interval } from 'rxjs';
 import { take } from 'rxjs/operators';
 
 // Schedule something once after half a second
 const period = 1000; 
 const poll$ = interval(period);
 
 poll$
   .pipe(take(4))
   .subscribe({
     next: (x: number) => console.log(`Delayed by ${period}ms item: ${x}`),
     complete: () => console.log('Delayed complete!')
   });