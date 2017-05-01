import * as types from './types'

const defaultState = {
  example: false
}

export default function reducer(state = defaultState, action) {
  if (!action || !action.type) return state
  switch (action.type) {
    case types.CHOOSE_EXAMPLE:
      return {
        ...state,
        example: action.payload
      }
    default:
      return state
  }
}
