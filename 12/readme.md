# Day 12 - Implementing Redux with RxJS

In the [previous entry](../11/readme.md), we covered subjects, and their uses, whether it is `Subject`, `ReplaySubject`, `AsyncSubject`, and lastly the `BehaviorSubject`.  This all leads up to understanding the [Redux](https://redux.js.org/) library and understanding state management and its patterns.  From there, we will understand how we could implement those features from Redux using RxJS and the knowledge we've covered so far in the series.

## Intro to Redux

At its heart, Redux is a state container for JavaScript apps.  It became particularly popular in the React ecosystem.  The library was based on the Flux architecture which introduced the concepts of stores, actions and dispatchers.  Redux diverged from Flux a little bit renaming stores to reducers, no concept of a dispatcher, and relies on pure functions.

Let's implement a simple counter using the concepts of Redux, with our "store" and our reducer, and how we can send messages to it.  Let's add some boilerplate so that we get nicely typed experience instead of magic strings, using enums.

```typescript
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
```

Now, let's get to the heart of the matter, which is to implement the reducer function.  This will react to actions as they come in, such as `Increment` or `Decrement`, and returning new state based upon the action and previous state.

```typescript
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
```

We can then create the store which is bound to our reducer function.  This store allows us to get the current state, dispatch an action to the reducer, and subscribe to any state changes.

```typescript
const store = createStore(counter);
```

We will keep track of all state changes in our `render` function, where we subscribe to changes via, surprise, the `subscribe` method.  This method takes no arguments and returns no value.  We can then initially render the data.

```typescript
function render() {
  console.log(`Rendering changes with ${store.getState().value}`);
}

render();
const unsubscribe = store.subscribe(render);
```

Now we can increment or decrement the state via dispatching an action via the `dispatch` method.  Doing so call our reducer, and then trigger our `render` function.

```typescript
// Increment
store.dispatch({ type: ActionType.Increment });
// Rendering changes with 1

// Decrement
store.dispatch({ type: ActionType.Decrement });
// Rendering changes with 0
```

You can see some similarities here to what we've already learned so far.  In fact, there are some learnings that Redux got from RxJS in the [Prior Art](https://redux.js.org/introduction/prior-art#rxjs) section of the Redux site.  For a full source for this example, see [`redux.ts`](redux.ts)

## Implementing Redux in RxJS

Using Subjects, `startWith` and `scan`, we can implement the core concepts of Redux using RxJS directly.  In fact, we could have easily implemented the main part of Redux as shown above as the following code.

```typescript
import { Subject } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';

const store$ = new Subject();
const subscription = store$
  .pipe(
    scan(reducer, initialState),
    startWith(initialState)
  )
  .subscribe({
    next: render
  });
```

So, let's look at the changes you need to make to fit it into an RxJS solution.  We would need to change the `render` function since we do not have access to the current value, instead we get the new state passed into it.  The other change is using `next` to dispatch our actions to our reducer instead of the `dispatch` method.

```typescript
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
// Rendering changes with 1

// Decrement
store$.next({ type: ActionType.Decrement });
// Rendering changes with 0
```

That's it for the basic implementation of Redux using RxJS, but we will dive further into Redux and async actions soon enough!  Stay tuned!