import { 
  Observable,
  SchedulerLike,
  animationFrameScheduler
} from 'rxjs';

// Polyfill requestAnimationFrame
import * as raf from 'raf';
raf.polyfill();

function once<T>(value: T, scheduler: SchedulerLike) {
  return new Observable<T>(observer => {
    return scheduler.schedule(() => {
      observer.next(value);
      observer.complete();
    });
  });
}

const subscription = once(42, animationFrameScheduler)
  .subscribe({
    next:x => console.log(`Next: ${x}`),
    complete: () => console.log(`Complete!`)
  });

// If we really don't want it to happen  
//subscription.unsubscribe();