import * as types from './types'

export function chooseExample(example) {
  return {
    type: types.CHOOSE_EXAMPLE,
    payload: example
  }
}
