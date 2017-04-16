import createMiddleware from '../src/middleware'
import * as actions from '../src/actions'

describe('middleware', () => {
  it('subscribes to history', () => {
    const spy = {
      listen: sinon.spy(),
      location: {
        pathname: 'hi',
        search: '',
        hash: ''
      }
    }
    const store = {
      dispatch: sinon.spy()
    }
    const mid = createMiddleware(spy)
    expect(mid(store)).is.instanceof(Function)
    expect(spy.listen).called
    expect(spy.listen.args[0][0]).is.instanceof(Function)
    spy.listen.args[0][0]({
      pathname: 'foo',
      search: '',
      hash: ''
    })
    expect(store.dispatch.called).is.true
    expect(store.dispatch.args[0]).eqls([actions.route({
      pathname: 'foo',
      search: '',
      hash: ''
    })])
    store.dispatch = sinon.spy()
    spy.listen.args[0][0]({
      pathname: 'foo',
      search: '',
      hash: ''
    })
    expect(store.dispatch.called).is.false
  })
  it('')
})
