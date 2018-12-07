import { Observable } from 'rxjs';

let n = 0;
let id: NodeJS.Timeout = null;

// Create an Observable from scratch
const number$ = new Observable<number>(observer => {
  id = setInterval(() => {
    // Counter to run 5 times
    if (n++ < 5) {
      observer.next(n);
    } else {
      // When finished, clear the interval and complete the stream
      observer.complete();
    }
  }, 1000);

  return () => clearInterval(id);
});

// Handle only the next and completion handkers
const observer = {
  next: (x: number) => {
    console.log(`Next: ${x}`);
  },
  complete: () => {
    console.log(`Complete!`);
  }
};

// Subscribe to the Observable with our obsercer
const subscription = number$.subscribe(observer);

// Terminate the sequence early if you want to
// setTimeout(() => subscription.unsubscribe(), 2500);
