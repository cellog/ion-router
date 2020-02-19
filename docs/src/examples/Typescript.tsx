import React from 'react'
import { Dispatch } from 'redux'
import { useDispatch } from 'react-redux'
import {
  Routes,
  Route,
  Toggle,
  RouteToggle,
  Link,
  FullStateWithRouter,
} from 'ion-router'

interface StoreState {
  there: string
}

interface ChangeAction {
  type: 'UPDATE_THERE'
  payload: string
}

const HiThereToggle = RouteToggle('hithere')
const ThereToggle = Toggle(
  (state: StoreState & FullStateWithRouter) => state.there === 'Greg'
)

export const reducer = {
  there: (state = '', action: ChangeAction) => {
    if (!action || !action.type) return state
    if (action.type === 'UPDATE_THERE') return action.payload || ''
    return state
  },
}

export default function Typescript(props: StoreState) {
  const dispatch = useDispatch<Dispatch<ChangeAction>>()
  const change = (newThere: string) =>
    dispatch({
      type: 'UPDATE_THERE',
      payload: newThere,
    })
  return (
    <div>
      <p>
        This simple example demonstrates using <code>Link</code>,
        <code>Routes</code>, <code>Route</code>, and two toggles,
        <code>RouteToggle</code> and <code>Toggle</code>.
      </p>
      <ul>
        <li>
          <Link route="home">Home</Link>
        </li>
        <li>
          <Link route="hithere" there="Somebody">
            Hi to Somebody
          </Link>
        </li>
        <li>
          <Link route="hithere" there="Greg">
            Hi to Greg
          </Link>
        </li>
        <li>
          Change value of <code>there</code> in store:
          <input value={props.there} onChange={e => change(e.target.value)} />
        </li>
      </ul>
      <HiThereToggle
        component={() => (
          <div>
            Hi {props.there}!
            <ThereToggle component={() => <div>It&apos;s Greg!!</div>} />
          </div>
        )}
        else={() => <div>Home</div>}
      />
      <Routes>
        <Route path="/" name="home" />
        <Route
          path="/hi(/:there)"
          name="hithere"
          stateFromParams={(params: { there: string }) => params}
          paramsFromState={state => ({ there: state.there })}
          updateState={{
            there: (t): ChangeAction => ({ type: 'UPDATE_THERE', payload: t }),
          }}
        />
      </Routes>
    </div>
  )
}
