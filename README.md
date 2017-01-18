# react-redux-saga-router
###### Connecting your url and redux state

[![Code Climate](https://codeclimate.com/github/cellog/react-redux-saga-router/badges/gpa.svg)](https://codeclimate.com/github/cellog/react-redux-saga-router) [![Test Coverage](https://codeclimate.com/github/cellog/react-redux-saga-router/badges/coverage.svg)](https://codeclimate.com/github/cellog/react-redux-saga-router/coverage) [![Build Status](https://travis-ci.org/cellog/react-redux-saga-router.svg?branch=master)](https://travis-ci.org/cellog/react-redux-saga-router) [![npm](https://img.shields.io/npm/v/react-redux-saga-router.svg)](https://www.npmjs.com/package/react-redux-saga-router)

Elegant powerful routing based on the simplicity of storing url as state

To install:

```bash
$ npm i -S react-redux-saga-router
```
Table of Contents
=================

* [Simple example](#simple-example)
  * [Extending the example: asynchronous state loading](#extending-the-example-asynchronous-state-loading)
  * [What about complex routes like react\-router ?](#what-about-complex-routes-like-react-router-)
  * [enter/exit hooks](#enterexit-hooks)
  * [Code splitting and asynchronous loading of Routes](#code-splitting-and-asynchronous-loading-of-routes)
  * [Explicitly changing URL](#explicitly-changing-url)
  * [Reverse routing: creating URLs from parameters](#reverse-routing-creating-urls-from-parameters)
* [Principles](#principles)
  * [URL state is just another asynchronous input to redux state](#url-state-is-just-another-asynchronous-input-to-redux-state)
  * [When the URL changes, it should cause a state change in the redux store](#when-the-url-changes-it-should-cause-a-state-change-in-the-redux-store)
  * [When the state changes in the redux store, it should be reflected in the URL](#when-the-state-changes-in-the-redux-store-it-should-be-reflected-in-the-url)
  * [Route definition is separate from the components](#route-definition-is-separate-from-the-components)
  * [IndexRoute, Redirect and ErrorRoute are not necessary](#indexroute-redirect-and-errorroute-are-not-necessary)
  * [Easy testing](#easy-testing)

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
the list is loaded, and the user will just see an empty list of todos.  If they add a todo,
the todo id could suddenly conflict with todos the user creates, which would erase them on the
database load.  Better is to display a different component while loading.

To implement this with our router, you will use:

 1. a loading component that will be displayed when the todos are loading
 2. a "Toggle" higher order component that is used to switch on/off display of a
    component or its loading component
 3. an asynchronous program to load the todos from the database.
 4. an additional way of marking whether state is loaded or not in the store, and
    actions and reducer code to capture this state.

redux-saga is an excellent solution for expressing complex asynchronous actions in a
simple way.  Although react-redux-router-saga uses redux-saga internally and highly
recommends it, you can write your asynchronous loader in any manner you choose, whether
it is a thunk or an epic or fill-in-your-favorite.

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

Now let's create a Toggle.  A Toggle is a higher order component that responds to state in order
to turn on or off the display of a component, like a toggle switch.  It takes 2 callbacks as parameters.
Each callback receives the state as a parameter and should return truthy or falsey values.  The first is
used to determine whether the main component should be displayed.  The second optional callback is used
to determine whether state is still loading, and if so, whether to display the loading component.
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

The TodosToggle is a component that accepts 2 props: `component` and `loadingComponent`.
`component` should be a React component or connected container to display if the
Toggle condition is satisfied, and `loadingComponent` should be a React component or connected
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
    <TodosToggle component={VisibleTodoList} loadingComponent={Loading} /><!-- simple! -->
    <Footer />
  </div>
)

export default App
```

Now our component will display the todo list only when it has loaded.

### What about complex routes like react-router &lt;Route&gt;?

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

Note that the `else` prop of a Toggle higher order component can be used to display an
alternative component if the state test is not satisfied, but the component state is loaded.
So in our example, we want to display the user list if a user is not selected, so we set our
`else` to `UserList` and our `component` to `User`

Users.js:
```javascript
  render() {
    return (
      <div>
        <SelectedUserToggle component={User} else={UserList}/>
      </div>
    )
  }
```

Easy!

### `enter`/`exit` hooks

Hooks are defined by passing in a function or a saga to a route definition.

```javascript
function *enter(lastUrl, url) {
  // do anything that you want here, but return
  // false to cancel navigation and return to lastUrl
  // this should ONLY be used to determine whether to cancel navigation
  // into a new route
}
function *exit(lastUrl, url) {
  // do anything that you want here, but return
  // false to cancel navigation and return to lastUrl
  // this should ONLY be used to determine whether to cancel navigation
  // out of an old route
}
const routes = () => (
  <Routes>
    <Route name="fancy" path="/fancy/:shmancy"
      enter={enter}
      exit={exit}
    />
  </Routes>
)
```

### Code splitting and asynchronous loading of Routes

Routes can be loaded at any time.  If you load a new component asynchronously (using
require.ensure, for instance), and dynamically add a new `<Routes><Route>...` inside that
component, the router will seamlessly start using the route.  Code splitting has never
been simpler.

### Explicitly changing URL

A number of actions are provided to change the browser state directly, most useful
for menus and other direct links.

react-redux-saga-router uses the [history](https://github.com/mjackson/history) package
internally.  The actions mirror the push/replace/go/goBack/goForward methods as
documented for the history package.

### Reverse routing: creating URLs from parameters

The `makePath` function is available for creating a url from params, allowing
separation of the URL structure from the data that is used to populate it.

```javascript
import { makePath } from 'react-redux-saga-router'

// if we have a route like this:
const a = <Route name="foo" path="/my/:fancy/path(/:wow/*supercomplicated(/:thing))" />

console.log(makePath('foo', {
  fancy: 'pants'
}))
// '/my/pants/path'
console.log(makePath('foo', {
  fancy: 'pants',
  wow: 'oops'
}))
// this will not match the second portion because "supercomplicated" is not specified
// '/my/pants/path'
console.log(makePath('foo', {
  fancy: 'pants',
  wow: 'yes',
  supercomplicated: '/this/works/just/fine'
}))
// '/my/pants/path/yes/this/works/just/fine
console.log(makePath('foo', {
  fancy: 'pants',
  wow: 'yes',
  supercomplicated: '/this/works/just/fine',
  thing: 'wheeee'
}))
// '/my/pants/path/yes/this/works/just/fine/wheeee
```

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
synchronous localStorage?  Let's stop thinking of the URL as a state container.  It
is an input that we can use to create state.

### When the URL changes, it should cause a state change in the redux store

We want our URL to change the way the application works.  This allows users to bookmark a
particular view, such as an email (/inbox/message/243) or a particular todo list filter
(/todos/all or /todos/search/house)

### When the state changes in the redux store, it should be reflected in the URL

If a user clicks on something that affects the application state by triggering an action,
such as selecting an email to view, we want the URL to then update so the user can bookmark
that application state or share it.

This single principle is the reason for the existence of this router.

### Route definition is separate from the components

Because URL state is just another input to the redux state, we only need to define
how to transform URLs into redux state.  Components then choose whether to render based
on that state.  This is a crucial difference from every other router out there.

### IndexRoute, Redirect and ErrorRoute are not necessary

Use Toggle and smart (connected) components to do all of this logic.  For example, an
error route is basically a toggle that only displays when other routes are not selected.
You can use the `noMatches` selector for this purpose.  An indexRoute can be implemented
with the `matchedRoute('/')` selector (and by defining a route for '/').

A redirect can be implemented simply by listening for a URL in a saga and pushing a new
one:

```javascript
import { replace } from 'react-redux-saga-router'
import { ROUTE } from 'react-redux-saga-router/types'
import { take, put } from 'redux-saga/effects'
import { createPath } from 'history'
import RouteParser from 'route-parser' // this is used internally

function *redirect() {
  while (true) {
    const action = yield (take(ROUTE))
    const parser = new RouteParser('/old/path/:is/:this')
    const newparser = new RouteParser('/new/:is/:this')
    const params = parser.match(createPath(action))
    if (params) {
      yield put(replace(newparser.reverse(params)))
    }
  }
}
```

### Easy testing

Everything is properly isolated, and testable.  You can easily unit test your route
stateFromParams and paramsFromState and updateState properties.  Components are
simply components, no magic.
