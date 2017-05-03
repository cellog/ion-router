<img src='ion-router.png' alt='Ion Router Logo' width='300px'>

# ion-router
###### Connecting your url and redux state

[![Code Climate](https://codeclimate.com/github/cellog/ion-router/badges/gpa.svg)](https://codeclimate.com/github/cellog/ion-router) [![Test Coverage](https://codeclimate.com/github/cellog/ion-router/badges/coverage.svg)](https://codeclimate.com/github/cellog/ion-router/coverage) [![Build Status](https://travis-ci.org/cellog/ion-router.svg?branch=master)](https://travis-ci.org/cellog/ion-router) [![npm](https://img.shields.io/npm/v/ion-router.svg)](https://www.npmjs.com/package/ion-router)

Elegant powerful routing based on the simplicity of storing url as state

To install:

```bash
$ npm i -S ion-router
```
Table of Contents
=================

  * [Simple example](#simple-example)
    * [Internal Linking with &lt;Link&gt;](#internal-linking-with-link)
    * [Extending the example: asynchronous state loading](#extending-the-example-asynchronous-state-loading)
    * [Available selectors for Toggle](#available-selectors-for-toggle)
    * [What about complex routes like react\-router nested &lt;Route&gt;?](#what-about-complex-routes-like-react-router-nested-route)
    * [Dynamic Routes](#dynamic-routes)
    * [enter/exit hooks](#enterexit-hooks)
    * [Code splitting and asynchronous loading of Routes](#code-splitting-and-asynchronous-loading-of-routes)
    * [Server-side Rendering](#server-side-rendering)
    * [Explicitly changing URL](#explicitly-changing-url)
  * [Why a new router?](#why-a-new-router)
  * [Principles](#principles)
    * [URL state is just another asynchronous input to redux state](#url-state-is-just-another-asynchronous-input-to-redux-state)
    * [When the URL changes, it should cause a state change in the redux store](#when-the-url-changes-it-should-cause-a-state-change-in-the-redux-store)
    * [When the state changes in the redux store, it should be reflected in the URL](#when-the-state-changes-in-the-redux-store-it-should-be-reflected-in-the-url)
    * [Route definition is separate from the components](#route-definition-is-separate-from-the-components)
    * [IndexRoute, Redirect and ErrorRoute are not necessary](#indexroute-redirect-and-errorroute-are-not-necessary)
    * [Easy testing](#easy-testing)
    * [License](#license)
    * [Thanks](#thanks)

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

To do this, we'll need to add four items to the app:

 1. The router reducer, for storing routing state.
 2. A route definition, mapping url to state, and state to url
 3. The route definition within the app itself
 4. include redux-saga and react-redux, and pass in the sagaMiddleware and connect

reducers/index.js:
```javascript
import { combineReducers } from 'redux'
import routing from 'ion-router/reducer' // the new line
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
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
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
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux' // new - import connect
import makeRouter, { makeRouterStoreEnhancer } from 'ion-router' // our router - new line

import todoApp from './reducers'
import App from './components/App'

// set up the router and create the store
const routerEnhancer = makeRouterStoreEnhancer()
const store = createStore(todoApp, undefined, routerEnhancer) // router store enhancer
makeRouter(connect, store) // set up the router


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
    <AddTodo />
    <VisibleTodoList />
    <Footer />
    <Routes /><!-- new line -->
  </div>
)
```

### Internal linking with `<Link>`

Note that if we want to set up a menu of urls, ion-router provides a
`<Link>` component that should be used for all internal links.  It uses the `to`
prop in place of href.  An onClick handler may be passed to handle the click in
a custom fashion.  All other props will be passed through to the internal `<a>`
tag.

If you wish to replace the current url instead of pushing, use the `replace` prop
instead of the `to` prop.

Unlike any other router, the `<Link>` component can also create abstract routes
from a list of route parameters. With this route declaration:

```javascript
const routes = () => (
  <Routes>
    <Route name="biff" path="/this/:fancy(/:thing)" />
  </Routes>
)
```

we can create a link like so:

```javascript
const App = () => (
  <div>
    <Link route="biff" fancy="hi" thing={some.dynamicValue} />
  </div>
)
```

and if the dynamic value refers to `123` the route will link to `/this/hi/123`

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
simple way.  You can write your asynchronous loader in any manner you choose, whether
it is a thunk, saga, observable, or fill-in-your-favorite.

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
import Toggle from 'ion-router/Toggle'

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

### Common use case: displaying a component when a route is selected

In most applications, there are menus that select components based on the user
selecting a sub-application.  To display components whose sole display criteria is
the selection of a route, use a `RouteToggle`

```javascript
import RouteToggle from 'ion-router'

const TodosRoute = RouteToggle('todos')
```

In this way, you can display several components scattered around a layout template
that are route-specific without having to make a new layout template just for that route,
or doing any strange contortions.

A `RouteToggle` accepts all the arguments of Toggle after the route name to match:

```javascript
import RouteToggle from 'ion-router'

const TodosRoute = RouteToggle('todos', state => state.whatever === 'hi')
```

The example above will only toggle if the todos route is active and the `whatever`
portion of state is equal to 'hi'

A `RouteToggle` can be thought of
as a simpler version of this source code:

```javascript
import Toggle from 'ion-router/Toggle'
import { matchedRoutes } from 'ion-router/selectors'

const TodosRoute = Toggle(state => matchedRoutes(state, 'todos'))
```

### Available selectors for Toggles

The following selectors are available for use with Toggles. import as follows:

```javascript
import * as selectors from 'ion-router/selectors'
```

#### matchedRoute(state, name)

```javascript
import * as selectors from 'ion-router/selectors'
import Toggle from 'ion-router/Toggle'

export Toggle(state => selectors.matchedRoute(state, 'routename'))
```

`matchedRoute` accepts a single route name, or an array of route names to match.
By default, it matches on any route.  To enable strict matching (all routes must match)
pass in true to the third parameter of matchedRoute

```javascript
import * as selectors from 'ion-router/selectors'
import Toggle from 'ion-router/Toggle'

export Toggle(state => selectors.matchedRoute(state, ['route', 'subroute'], true))
```

This is useful for strict matching of a sub-route path.

Note that a convenience Toggle, `RouteToggle` exists to match a route:

```javascript
import RouteToggle from 'ion-router/RouteToggle'

export RouteToggle('routename', state => otherconditions())
```

This selector returns true if the route specified by `'routename'` is active

#### noMatches
```javascript
import * as selectors from 'ion-router/selectors'
import Toggle from 'ion-router/Toggle'

export Toggle(state => selectors.noMatches(state))
```

This selector returns true if no routes match, and can be used for an error component
or default component

#### stateExists

```javascript
import * as selectors from 'ion-router/selectors'
import Toggle from 'ion-router/Toggle'

export Toggle(state => state.whatever, state => selectors.stateExists(state, /* state descriptor */))
```

This toggle is designed to be used to detect whether state has loaded.  Pass in
a skeleton of the state shape and it will traverse the state to determine whether it exists.

Here is a sample from an actual project:

```javascript
import Toggle from 'ion-router/Toggle'
import * as selectors from 'ion-router/selectors'

export const check = state => selectors.stateExists(state, {
  campers: {
    ids: []
  },
  groups: {
    ids: [],
    groups: {},
    selectedGroup: (group, state) => {
      if (!group) return true
      if (state.groups.ids.indexOf(group) === -1) return false
      const g = state.groups.groups[group]
      if (!g) return false
      if (g.type && !state.ensembleTypes.ensembleTypes[g.type]) return false
      if (g.members.length) {
        if (g.members.some(m => m ? !state.campers.campers[m] : false)) return false
      }
      return true
    }
  },
  ensembleTypes: {
    ids: [],
  },
})

export default Toggle(state => state.groups.selectedGroup, check)
```

The selector verifies that the campers and ensembleTypes state areas have an ids
member that is an array, and that the groups state area has ids and groups set up.
For selectedGroup, a callback is called, passed the value of the state item plus the
entire state tree. The callback verifies that the selected group's state is internally
consistent and when everything is set up, returns true.

### What about complex routes like react-router nested `<Route>`?

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
using ion-router?

We need 2 things:

 1. Toggles for routes and for selected user, and for no match
 2. Plugging in the Toggles where they should be displayed within the React tree.

```javascript
import * as selectors from 'ion-router/selectors'
import Toggle from 'ion-router/Toggle'
import RouteToggle from 'ion-router/RouteToggle'

const AboutToggle = RouteToggle('about')
const UsersToggle = RouteToggle(['users', 'user'])
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
        <UsersToggle component={UsersRoute} />
        <NoMatchToggle component={NoMatch} />
      </div>
    )
  }
```

Routes.js:
```javascript
import React from 'react'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import * as actions from './actions'

const paramsFromState = state => ({ userId: state.users.selectedUser || undefined })
const stateFromParams = params => ({ userId: params.userId || false })
const updateState = {
  userId: id => actions.setSelectedUser(id)
}
const exitParams = {
  userId: undefined
}

export default () => (
  <Routes>
   <Route name="about" path="/about" />
   <Route name="users" path="/users" />
   <Route name="user" path="/user/:userId"
     paramsFromState={paramsFromState}
     stateFromParams={stateFromParams}
     exitParams={exitParams}
     updateState={updateState}
   />
  </Routes>
)
```

Note that the `else` prop of a Toggle higher order component can be used to display an
alternative component if the state test is not satisfied, but the component state is loaded.
So in our example, we want to display the user list if a user is not selected, so we set our
`else` to `Users` and our `component` to `User`

UsersRoute.js:
```javascript
  render() {
    return (
      <div>
        <SelectedUserToggle component={User} else={Users}/>
      </div>
    )
  }
```

### Dynamic Routes

Sometimes, it is necessary to implement dynamic routes that are calculated from a parent
route. This can be done quite easily.

```javascript
// parent route
const Parent = () => (
  <Routes>
   <Route name="parent" path="/parent/path" />
  </Routes>
)
// dynamically loaded later
const Child = ({ parentroute }) => (
  <Routes>
    <Route name="child" parent={parentroute} path=":hi" />
  </Routes>
)
```

In this case, the child will make its path match `/parent/path/:hi`

### `enter`/`exit` hooks

To implement enter or exit hooks you can listen for the `ENTER_ROUTES` or
`EXIT_ROUTES` action to perform actions such as loading asynchronous state.
Here is a sample implementation:

```javascript
import * as types from 'ion-router/types'

function *enter() {
  while (true) {
    const action = yield take(types.ENTER_ROUTE)
    if (action.payload.indexOf('myroute') === -1) continue
    // enter code goes here
    do {
      const second = yield take(types.EXIT_ROUTE)
    } while (second.payload.indexOf('myroute') === 1)
    // exit code goes here
  }
}
```

Anything can be done in this code, including forcing a route to change, like a traditional
enter/exit hook.  Because it is so trivial to implement this with the above code, the
event loop that listens for URL changes and state changes does not listen for enter/exit
hooks directly.

#### updating state on route exit

All routes that accept parameters and map them to state will need to unset that state
upon exiting the route.  ion-router can do this automatically for any
route with only optional parameters, such as:

`/path(/:optional(/:second_optional))`

However, for routes that have a required parameter such as:

`/path/:required`

you need to tell the router how to handle this case.  If the required parameter should
be simply set to undefined upon exiting, then you need to explicitly pass this
into the `exitParams` prop for `<Route>`

```javascript
exitParams = {
  required: undefined
}
const Routes = () => (
  <Routes>
    <Route
      name="test"
      path="/path/:required"
      stateToParams={...}
      paramsToState={...}
      updateState={...}
      exitParams={exitParams}
    />
  </Routes>
)
```

If you wish to dynamically set up the parameters based on existing parameters, pass
in a function that accepts the previous url's params as an argument and returns the
exit params:

```javascript
exitParams = params => ({
  required: params.required,
  optional: undefined
})
const Routes = () => (
  <Routes>
    <Route
      name="test"
      path="/path/:required(/:optional)"
      stateToParams={...}
      paramsToState={...}
      updateState={...}
      exitParams={exitParams}
    />
  </Routes>
)
```

### Code splitting and asynchronous loading of Routes

Routes can be loaded at any time.  If you load a new component asynchronously (using
require.ensure, for instance), and dynamically add a new `<Routes><Route>...` inside that
component, the router will seamlessly start using the route.  Code splitting has never
been simpler.

### Server-side Rendering

When rendering routes on the server, there are 2 options.  No changes need be made
to the component source.  However, because of the way server rendering works, multiple
actions and re-renders will occur when setting up routes.  To avoid the performance
penalty for complex applications, an optional third parameter to the router setup
can be used to pass in the routes.  The definition of routes is an object with the
same keys as the props one would pass to a `<Route>` tag.

so instead of:

```javascript
// set up our router
makeRouter(connect, store)

exitParams = params => ({
  required: params.required,
  optional: undefined
})
const Routes = () => (
  <Routes>
    <Route
      name="test"
      path="/path/:required(/:optional)"
      stateToParams={...}
      paramsToState={...}
      updateState={...}
      exitParams={exitParams}
    />
  </Routes>
)
```

one would use:


```javascript
exitParams = params => ({
  required: params.required,
  optional: undefined
})

// set up our router
makeRouter(connect, store, [{
  name: 'test',
  path: '/path/:required(/:optional)',
  stateToParams=...,
  paramsToState=...,
  updateState={...},
  exitParams={exitParams},
}])

```

The same setup can be used on both client and server for root routes, so there is no
need to keep the `<Routes>` and `<Route>` elements in your component tree if
you choose to initialize on start-up.  You should continue to use the components for
dynamic routes loaded later.

### Explicitly changing URL

A number of actions are provided to change the browser state directly, most useful
for menus and other direct links.

ion-router uses the [history](https://github.com/mjackson/history) package
internally.  The actions mirror the push/replace/go/goBack/goForward methods as
documented for the history package.

```javascript
import * as actions from 'ion-router/actions'
dispatch(actions.push('/path/to/go/to/next'))
dispatch(actions.goBack())
// etc.
```

## Why a new router?

[react-router](https://github.com/ReactTraining/react-router) is a mature router for
React that has a huge following and community support. Why create a new router?
In my work with react-router, I found that it was not possible to achieve
some basic goals using react-router. I couldn't figure out a way to store state from
url parameters and easily change the url from the state when using redux. It is the
classic two-way binding issue: if there are 2 sources of state, they will fight and
cause unexpected bugs.

In addition, I moved to redux for state because the tree of components in React rarely
corresponds to the way data is used.  In many cases, I find myself rendering different
portions of the component tree using the same data. So I will have 2 React components
in totally different parts of the component tree using the same piece of data.
With react-router, I found myself duplicating a lot of content with a single component,
or using complex routing rules to enable displaying this information.  react-router
version 4 allows declaring the same route multiple times throughout the code, but
this can make things more confusing, and opens up another vector for bugs since
route information must be duplicated wherever it is used.

With ion-router, multiple components can respond to a route change anywhere
in the React component tree, allowing for more modular design.  The below solution
is more performant both because the components
are not rendered at all if the route is not satisfied.

```javascript
import React from 'react'
import Routes from 'ion-router/Routes'
import Route from 'ion-router/Route'
import Toggle from 'ion-router/Toggle'
import { connect } from 'react-redux'

import * as actions from './actions'

const albumRouteMapping = {
  stateFromParams: params => ({ id: params.album, track: +params.track }),
  paramsFromState: state => ({
    album: state.albums.selectedAlbum.id,
    track: state.albums.selectedTrack ? state.albums.selectedTrack : undefined
  }),
  updateState: {
    id: id => actions.selectAlbum(id),
    track: track => actions.playTrack(track)
  }
}

const TrackToggle = Toggle(state => state.albums.selectedTrack,
                           state => state.albums.selectedTrack
                            && state.albums.allTracks[state.albums.selectedTrack].loading)
const AlbumToggle = Toggle(state => state.albums.selectedAlbum)

const AlbumList = ({ albums, selectAlbum }) => (
  <ul>
    {albums.map(album => <li key={album.id} onClick={selectAlbum(album.id)}>{album.name}</li>)}
  </ul>
)

const AlbumDetail = ({ album, playTrack }) => (
  <ul>
    <li>Album details</li>
    <li>...(stuff from the {album.name}</li>
    {album.tracks.map(track => <li key={track.id} onClick={playTrack(track.id)}>{track.name}</li>)}
  </ul>
)

const AlbumSummary = ({ album }) => {
  <h1>
    {album.name}
  </h1>
}

const TrackPlayer = ({ track }) => {
  <div>
    <h1>{track.title}</h1>
    <AudioPlayer audio={track.audio} /> <!-- pretend this exists -->
  </div>
}

const AlbumSummaryContainer = connect(state => ({ album: state.albums.selectedAlbum }))(AlbumSummary)
const AlbumListContainer = connect(state => ({ albums: state.albums.allAlbums }),
                                   dispatch => ({ selectAlbum: id => dispatch(actions.selectAlbum(id)) }))(AlbumList)
const AlbumDetailContainer = connect(state => ({ album: state.albums.selectedAlbum }),
                                     dispatch => ({ playTrack: id => dispatch(actions.selectTrack(id)) }))(AlbumDetail)
const TrackPlayerContainer = connect(state => ({ track: state.albums.tracks[state.albums.selectedTrack] }))(TrackPlayer)

const MyComponent = () => (
  <div>
    <Routes>
      <Route name="main" path="/" />
      <Route name="albumlist" path="/albums(/album/:album(/track/:track))"
             {...albumRouteMapping}
      />
    </Routes>
    <TwoPanelLayout>
      <Panel>
        <AlbumToggle component={AlbumSummaryContainer} />
        <TrackToggle component={TrackPlayerContainer} />
      </Panel>
      <Panel>
        <AlbumToggle component={AlbumDetailContainer} else={AlbumListContainer} />
      </Panel>
    </TwoPanelLayout>
  </div>
)
```

In addition, declaring new routes in asynchronously loaded code is trivial with this
design.  One need only put in `<Routes>` declarations in the child code and the new routes
will be added, and also automatically removed if the child code is removed from the
render tree.

## Principles

Most routers start from an assumption that the url determines what part of the application
to display.  This results in a tree of urls mapping to components.  Because routes
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

### Components are explicitly used where they go, and can be moved anywhere

With traditional routers, you must render the component where the route is declared.
This creates rigidity.  In addition, with programs based on react-router, the link
between where a component exists and the route lives in the router.  The only indication
that something "routey" is happening is the presence of `{this.props.children}` which
can make debugging and technical debt higher.  This router restores the natural tree and
layout of a React app: you use the component where it will actually be rendered in the
tree.  Less technical debt, less confusion.

The drawback is that direct connection between URL and component is less obvious.  The
tradeoff seems worth it, as the URL is just another input to the program.  Currently,
the relationship between database definition and component is just as opaque, and that
works just fine, this is no different.

### IndexRoute, Redirect and ErrorRoute are not necessary

Use Toggle and smart (connected) components to do all of this logic.  For example, an
error route is basically a toggle that only displays when other routes are not selected.
You can use the `noMatches` selector for this purpose.  An indexRoute can be implemented
with the `matchedRoute('/')` selector (and by defining a route for '/').

A redirect can be implemented simply by listening for a URL in a saga and pushing a new
one:

```javascript
import { replace } from 'ion-router'
import { ROUTE } from 'ion-router/types'
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

To set up routes for testing in a unit test, the `synchronousMakeRoutes` functions is
available.  Pass in an array of routes, and use the return in the reducer

```javascript
import { synchronousMakeRoutes, routerReducer } from 'ion-router'

describe('some component that uses routes', () => {
  let fakeState
  beforeEach(() => {
    const action = synchronousMakeRoutes([
      {
        name: 'route1',
        path: '/route1'
      },
      {
        name: 'route1',
        path: '/route2/:thing',
        stateToParams: state => state,
        paramsToState: params => params,
        update: {
          thing: thing => ({ type: 'changething', payload: thing })
        }
      }
    ])
    fakeState = {
      routing: routerReducer(undefined, action)
    }
  })
  it('test something', () => {
    // use components that have <Link> or <Toggle>
  })
})
```

You will need to set this up for any `<Link>` components that use route to generate
the path, and any components that contain `<Router>` or `<Route>` tags when rendering
them.

## License

MIT License

## Thanks

[![http://www.browserstack.com](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)](http://www.browserstack.com)

Huge thanks to [BrowserStack](http://www.browserstack.com) for providing
cross-browser testing on real devices, both automatic testing and manual testing.