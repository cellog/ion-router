# react-redux-saga-router
###### Connecting your url and redux state

[![Code Climate](https://codeclimate.com/github/cellog/react-redux-saga-router/badges/gpa.svg)](https://codeclimate.com/github/cellog/react-redux-saga-router) [![Test Coverage](https://codeclimate.com/github/cellog/react-redux-saga-router/badges/coverage.svg)](https://codeclimate.com/github/cellog/react-redux-saga-router/coverage) [![Build Status](https://travis-ci.org/cellog/react-redux-saga-router.svg?branch=master)](https://travis-ci.org/cellog/react-redux-saga-router) [![npm](https://img.shields.io/npm/v/react-redux-saga-router.svg)](https://www.npmjs.com/package/react-redux-saga-router)

Elegant powerful routing based on the simplicity of storing url as state

To install:

```bash
$ npm i -S react-redux-saga-router
```

## Simple example

Expanding upon the [todo list example from the redux documentation](http://redux.js.org/docs/basics/ExampleTodoList.html)

The app will filter todos based on filter.  We'll respond to these 3 URLs:

```
/filter/SHOW_ALL
/filter/SHOW_ACTIVE
/filter/SHOW_COMPLETED
```

reducers/index.js:
```javascript
import { combineReducers } from 'redux'
import routing from 'react-redux-saga-router/reducer' // the new line
import todos from './todos'
import visibilityFilter from './visibilityFilter'

const todoApp = combineReducers({
  todos,
  visibilityFilter,
  routing // add the routing reducer
})

export default todoApp
```

Routes.js:
```javascript
import React from 'react'
import Routes from 'react-redux-saga-router/Routes'
import Route from 'react-redux-saga-router/Route'
import * as actions from './actions'

const paramsFromState = state => state.visibilityFilter
const stateFromParams = params => params.visibilityFilter || 'SHOW_ACTIVE'
const updateState = {
  visibilityFilter: filter => actions.setVisibilityFilter(filter)
}

export default () => (
  <Routes>
   <Route name="filters" path="/filter/:visibilityFilter"
    paramsFromState={paramsFromState}
    stateFromParams={stateFromParams}
    updateState={updateState}
   />
  </Routes>
)
```

index.js:
```javascript
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import router from 'react-redux-saga-router'

import todoApp from './reducers'
import App from './components/App'

let store = createStore(todoApp, undefined, applyMiddleware(sagaMiddleware))

router(sagaMiddleware)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

then add these lines inside App.js:

```javascript
import Routes from './Routes'
// ...

const App = () => (
  <div>
    <Routes />
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)
```

### Extending the example: asynchronous state loading

What if we are loading the todo list from a database?  We could display an empty list,
but it would be more friendly to the user to have a component that informs them
something is loading, but that we are not yet loaded.  Let's design that component first:

Loading.js:
```javascript
import React from 'react'

export default () => (
  <div>
    <h1>Loading...</h1>
  </div>
)
```

Let's assume we have added a new state item "loaded" that is used by the todo loader,
and that we are using a saga to load the state.  Here is that saga:

loadTodosSaga.js
```javascript
import { call, put } from 'redux-saga/effects'
import axios from 'axios'

import * as actions from './actions'

export default function *loadTodos() {
  // imagine we have a new action for marking loading as starting
  yield put(actions.setLoaded(false))
  const todos = yield call([axios, axios.get], '/getTodos')
  // imagine we have a new action for setting all the todos
  yield put(actions.setTodos(todos))
  // imagine we have a new action for marking loading as complete
  yield put(actions.setLoaded(true))
}
```

Now let's create a connected component that will either display the todos or the loading
indicator:

TodosToggle.js:
```javascript
import Toggle from 'react-redux-saga-router/Toggle'

export default Toggle(state => state.loaded, state => !state.loaded)
```

now we can use this toggle to display any component we want when loading is complete,
and a loading placeholder when loading is not yet complete.  Note that even though
we will be using this for the todo list in our example, the toggle is a generic
smart component.  It simply displays what it is asked to display.

Finally, the usage of TodosToggle is straightforward.

in App.js:
```javascript
import React from 'react'
import Footer from './Footer'
import AddTodo from '../containers/AddTodo'
import VisibleTodoList from '../containers/VisibleTodoList'

import Routes from './Routes'
import Loading from './Loading'
import TodosToggle from './TodosToggle'

const App = () => (
  <div>
    <Routes />
    <AddTodo />
    <TodosToggle component={VisibleTodoList} loading={Loading} />
    <Footer />
  </div>
)

export default App
```

Now our component will display the todo list only when it has loaded.

### What about routes like react-router <Route>?

For a complex application, there will be components that should only display on certain
routes.  For example, from the react-router documentation:

```javascript
render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="about" component={About}/>
      <Route path="users" component={Users}>
        <Route path="/user/:userId" component={User}/>
      </Route>
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
), document.getElementById('root'))
```

To achieve this kind of routing (the About component only displays on the about path),
we use a Toggle to toggle based on the matched routes.  A selector is provided that should
be used to create a component that only matches on a route.

```javascript
import * as selectors from 'react-redux-saga-router/selectors'
import Toggle from 'react-redux-saga-router/Toggle'

export default Toggle(state => selectors.matchedRoute('about'))
```

Then you should use the About component in the location you would within the App
component (where you had to place `{this.children}` or `{this.props.about}` using
react-router) using the new toggle.

```javascript
// App class render:
  render() {
    return (
      <div>
        <AboutToggle component={About} />
        //...
      </div>
    )
  }
```

You may even choose to render more than 1 component using the toggle, so that more
than one logical area of the application is changed when the state changes.

## Principles

Most routers start from an assumption that the url determines what part of the application
to display.  This first results in a tree of urls mapping to components.  Because routes
are defined by the URL, it then becomes necessary to provide hooks and an index route, and
an unknown route and so on and so forth.

However clever one is, this results in a very subtle logic flaw when using redux.  Redux-based
applications consider the store state to be a single source of truth.  As such, general 
state is not stored inside components, or pulled out of the client-side database or the
url state from pushState/popState.  [Read more about the state debate](https://github.com/reactjs/redux/issues/1287).

### URL state is just another asynchronous input to redux state

We are trained to think of the browser URL as some kind of magic all-knowing state container.
Simply because it is there and the user can directly change it to any value. But how different
is this really than a database accessed on the server via asynchronous xhr? Or even
synchronous localStorage?  The obvious answer is that it is no different, it just has a more
visible profile to the end user.  So let's stop thinking of the URL as a state container.  It
is an input that we can use to create statee

### When the URL changes, it should cause a state change in the redux store

We want our URL to change the way the application works.  This allows users to bookmark a
particular view, such as an email (/inbox/message/243) or a particular todo list filter
(/todos/all or /todos/search/house)

### When the state changes in the redux store, it should be reflected in the URL

If a user clicks on something that affects the application state by triggering an action,
such as selecting an email to view, we want the URL to then update so the user can bookmark
that application state or share it.

### Route definition is separate from the components

Because URL state is just another input to the redux state, we only need to define
how to transform URLs into redux state.  Components then choose whether to render based
on that state.  This is a crucial difference from every other router out there.

### Hooks are all handled by components or sagas

There is no need for hooks.  You can make sagas to intercept state changes and respond
to them, or you can handle the logic of a hook inside a reducer or by the components
themselves.

### IndexRoute and ErrorRoute are not necessary

Use Toggle and smart (connected) components to do all of this logic.  For example, an
error route is basically a toggle that only displays when other routes are not selected.
You can use the `noMatches` selector for this purpose.  An indexRoute can be implemented
with the `matchedRoute('/')` selector (and by defining a route for '/')