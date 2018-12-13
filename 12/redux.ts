import { createStore } from 'redux';

enum ActionType {
  Increment,
  Decrement
}

interface ReduxAction {
  type: ActionType;
}

interface ReduxState {
  value: number;
}
const INITIAL_STATE = { value: 0 };

function counter(state: ReduxState = INITIAL_STATE, action: ReduxAction) {
  switch (action.type) {
    case ActionType.Increment:
      return Object.freeze({ value: state.value + 1 });
    case ActionType.Decrement:
      return Object.freeze({ value: state.value - 1 });
    default:
      return state;
  }
}

const store = createStore(counter);

function render() {
  console.log(`Rendering changes with ${JSON.stringify(store.getState())}`);
}

render();
const unsubscribe = store.subscribe(render);

// Increment
store.dispatch({ type: ActionType.Increment });

// Decrement
store.dispatch({ type: ActionType.Decrement });