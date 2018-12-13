import { Subject } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';

enum ActionType {
  Increment,
  Decrement,
  Default
}

interface ReduxAction {
  type: ActionType;
}

interface ReduxState {
  value: number;
}
const INITIAL_STATE = { value: 0 };

function counter(state: ReduxState = INITIAL_STATE, action: ReduxAction = { type: ActionType.Default }) {
  switch (action.type) {
    case ActionType.Increment:
      return Object.freeze({ value: state.value + 1 });
    case ActionType.Decrement:
      return Object.freeze({ value: state.value - 1 });
    default:
      return state;
  }
}

const store$ = new Subject<ReduxAction>();
const action$ = store$.pipe(
  scan(counter, INITIAL_STATE),
  startWith(INITIAL_STATE)
);

const unsubscribe = action$.subscribe({ next: render });

function render(state: ReduxState = INITIAL_STATE) {
  console.log(`Rendering changes with ${state.value}`);
}

// Increment
store$.next({ type: ActionType.Increment });

// Decrement
store$.next({ type: ActionType.Decrement });