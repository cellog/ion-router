# react-redux-saga-router
###### Connecting your url and redux state

[![Code Climate](https://codeclimate.com/github/cellog/react-redux-saga-router/badges/gpa.svg)](https://codeclimate.com/github/cellog/react-redux-saga-router) [![Test Coverage](https://codeclimate.com/github/cellog/react-redux-saga-router/badges/coverage.svg)](https://codeclimate.com/github/cellog/react-redux-saga-router/coverage) [![Build Status](https://travis-ci.org/cellog/react-redux-saga-router.svg?branch=master)](https://travis-ci.org/cellog/react-redux-saga-router) [![npm](https://img.shields.io/npm/v/react-redux-saga-router.svg)](https://www.npmjs.com/package/react-redux-saga-router)

Elegant powerful routing based on the simplicity of storing url as state

To install:

```bash
$ npm i -S react-redux-saga-router
```

## Simple example

Let's expand upon the [todo list example from the redux documentation](http://redux.js.org/docs/basics/ExampleTodoList.html)

In the sample application, we can create new todos, mark them as finished, and filter
the list to display all of them, just active todos, and just completed todos.  We can
add URL routing quite simply by focusing on the filtering state.

We'll respond to these 3 URLs:

```
/filter/SHOW_ALL
/filter/SHOW_ACTIVE
/filter/SHOW_COMPLETED
```

To do this, we'll need to add three items to the app:

 1. The router reducer, for storing routing state.
 2. A route definition, mapping url to state, and state to url
 3. The route definition within the app itself

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

const paramsFromState = state => ({ visibilityFilter: state.visibilityFilter })
const stateFromParams = params => ({
  visibilityFilter: params.visibilityFilter || 'SHOW_ACTIVE'
})
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
import createSagaMiddleware from 'redux-saga' // redux-saga - new line
import router from 'react-redux-saga-router' // our router - new line

import todoApp from './reducers'
import App from './components/App'

// add the saga middleware
let store = createStore(todoApp, undefined, applyMiddleware(sagaMiddleware))

// set up our router
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
import Routes from './Routes' // new line
// ...

const App = () => (
  <div>
    <Routes /><!-- new line -->
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
)
```

### Extending the example: asynchronous state loading

What if we are loading the todo list from a database?  There will be a short delay while
the list is loaded, and the UI state will simply be undefined.  Better is to inform the
user that the UI is in a transition state with a loading component.

To implement this with our router, you need:

 1. a loading component that will be displayed when the todos are loading
 2. a "toggle" that is used to switch on/off display of a component or its loading component
 3. an asynchronous program to load the todos from the database.
 4. an additional way of marking whether state is loaded or not in the store, and
    actions and reducer code to capture this state.

redux-saga is an excellent solution for expressing complex asynchronous actions in a
simple way.  Although react-redux-router-saga uses redux-saga internally and highly
recommends it, you can write your asynchronous loader in any manner you choose, whether
it is a thunk or an epic.

For this example, we will assume that you can add a simple "loaded" field to the todos
reducer, and actions to set it to true or false.

Let's design the loading component first:

Loading.js:
```javascript
import React from 'react'

export default () => (
  <div>
    <h1>Loading...</h1>
  </div>
)
```

Asynchronous loading of the todo items from the database can be accomplished with a very
simple saga.  The saga assumes that the todos can be accessed via a REST service that
returns JSON, and uses the axios library to make an xhr call to retrieve it from the
server at the `"/getTodos"` address.

loadTodosSaga.js:
```javascript
import { call, put } from 'redux-saga/effects'
import axios from 'axios'

import * as actions from './actions'

export default function *loadTodos() {
  // mark loading as starting
  yield put(actions.setLoaded(false))
  const todos = yield call([axios, axios.get], '/getTodos')
  // a new action for setting all of the todos at once
  yield put(actions.setTodos(todos))
  // mark loading as finished
  yield put(actions.setLoaded(true))
}
```

Now let's create a Toggle.  A toggle is a smart component that responds to state in order
to turn on or off the display of a component.  It takes 2 callbacks that receive the state
and return truthy or falsey values.  The first is used to determine whether the main
component should be displayed.  The second optional callback is used to determine
whether state is still loading, and if so, whether to display the loading component.
By default, if no loading callback is passed in, a Toggle assumes that the state is
loaded.

In our example, there is only 1 route, and so we will display it if our state is marked
as loaded.  If not, we will not display the component.  Instead, we will display the
loading component.  Here is the source:

TodosToggle.js:
```javascript
import Toggle from 'react-redux-saga-router/Toggle'

export default Toggle(state => state.loaded, state => !state.loaded)
```

The TodosToggle is a component that accepts 2 props: `component` and `loader`.
`component` should be a React component or connected container to display if the
Toggle condition is satisfied, and `loader` should be a React component or connected
container to display if the loading condition is satisfied.

Note that if both callbacks return true, then the loading component will be displayed.

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
    <TodosToggle component={VisibleTodoList} loading={Loading} /><!-- simple! -->
    <Footer />
  </div>
)

export default App
```

Now our component will display the todo list only when it has loaded.

### What about complex routes like react-router <Route>?

For a complex application, there will be components that should only display on certain
routes.  For example, an example from the react-router documentation:

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

There are 3 things happening here.

 1. The App structure is dictated by the declaration of routes.  
 2. The `App` component will have as its `children` prop set to `About` or `Users` or
    `NoMatch`, depending on the url.   
 3. In addition, if the route is `/user/123` the `App` component
    will have its children set to `Users` with its children set to `User`

This complexity is forced by the design of react-router.  How can we express these routes
using react-redux-saga-router?

We need 2 things:

 1. Toggles for routes and for selected user, and for no match
 2. Plugging in the Toggles where they should be displayed within the React tree.

```javascript
import * as selectors from 'react-redux-saga-router/selectors'
import Toggle from 'react-redux-saga-router/Toggle'

const AboutToggle = Toggle(state => selectors.matchedRoute('about'))
const UsersToggle = Toggle(state => selectors.matchedRoute('users') || Toggle(state => selectors.matchedRoute('user')))
const SelectedUserToggle = Toggle(state => !!state.users.selectedUser,
  state => usersLoaded(state) && state.users.user[state.users.selectedUser])
const UsersListToggle = Toggle(state => !state.users.selectedUser,
  usersLoaded)
const NoMatchToggle = Toggle(state => selectors.noMatches(state))
```

Now, to plug them in:

App.js
```javascript
// App class render:
  render() {
    return (
      <div>
        <AboutToggle component={About} />
        <UsersToggle component={Users} />
        <NoMatchToggle component={NoMatch} />
      </div>
    )
  }
```

Routes.js:
```javascript
import React from 'react'
import Routes from 'react-redux-saga-router/Routes'
import Route from 'react-redux-saga-router/Route'
import * as actions from './actions'

const paramsFromState = state => ({ userId: state.users.selectedUser || undefined })
const stateFromParams = params => ({ userId: params.userId || false })
const updateState = {
  userId: id => actions.setSelectedUser(id)
}

export default () => (
  <Routes>
   <Route name="about" path="/about" />
   <Route name="users" path="/users" />
   <Route name="user" path="/user/:userId"
     paramsFromState={paramsFromState}
     stateFromParams={stateFromParams}
     updateState={updateState}
   />
  </Routes>
)
```

Users.js:
```javascript
  render() {
    return (
      <div>
        <UsersListToggle component={UserList} />
        <SelectedUserToggle component={User} />
      </div>
    )
  }
```

Easy!

### Asynchronous route loading

Routes can be loaded at any time.  If you load a new component asynchronously (using
require.ensure, for instance), and dynamically add a new `<Routes><Route>` inside that
component, the router will seamlessly start using the route.  Code splitting has never
been simpler.

### Explicitly changing URL

A number of actions are provided to change the browser state directly, most useful
for menus and other direct links.  The action names match the standard actions.
In addition, the makePath function is available for creating a url from params,
allowing separation of the URL structure from the data that is used to populate it.

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

### IndexRoute, Redirect and ErrorRoute are not necessary

Use Toggle and smart (connected) components to do all of this logic.  For example, an
error route is basically a toggle that only displays when other routes are not selected.
You can use the `noMatches` selector for this purpose.  An indexRoute can be implemented
with the `matchedRoute('/')` selector (and by defining a route for '/').  A redirect
can be implemented simply by a saga listening for a route match and pushing a new URL.

### Easy testing

Everything is properly isolated, and testable.  You can easily unit test your route
stateFromParams and paramsFromState and updateState properties.  Components are
simply components.