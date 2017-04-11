import * as effects from 'redux-saga/effects'
import { delay } from 'redux-saga'
import * as helpers from '../test_helper'

describe('react-redux-saga-router integration tests: url changes', () => {

  function another() {
    return 'hi'
  }

  function *foo(d) {
    while (true) {
      yield effects.take('hi')
      yield delay(d)
      yield effects.call(another)
      yield effects.put({ type: 'there', payload: 'wheee' })
    }
  }

  const run = helpers.testSaga()
  it('proof of concept', (done) => {
    run([
      [foo, 1500]
    ], function *() {
      yield effects.put.resolve(helpers.START)
      yield effects.put({ type: 'hi', payload: 'there' })
      let input = yield effects.take('take')

      expect(input.effect).eqls(effects.take('hi'))

      yield effects.take('promise')
      input = yield effects.take('call')
      expect(input.effect).eqls(effects.call(another))

      input = yield effects.take('put')
      expect(input.effect).eqls(effects.put({ type: 'there', payload: 'wheee' }))

      yield effects.call(done)
    })
  })
})
