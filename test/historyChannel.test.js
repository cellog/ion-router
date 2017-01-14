import { eventChannel, END } from 'redux-saga'
import historyChannel from '../src/historyChannel'
import createMemoryHistory from 'history/createMemoryHistory'

describe('react-redux-saga-router historyChannel', () => {
  let history, fakeHistory, unlisten, called
  beforeEach(() => {
    history = createMemoryHistory()
    called = sinon.spy()
    fakeHistory = {
      listen: emit => {
        called()
        unlisten = sinon.spy()
        return unlisten
      }
    }
  })
  it('creates an event channel', () => {
    const channel = historyChannel(fakeHistory)
    channel.close()
    expect(called.called).is.true
  })
  it('returns an unlisten', () => {
    const channel = historyChannel(fakeHistory)
    channel.close()
    expect(unlisten.called).is.true
  })
  it('returns history item', (done) => {
    const channel = historyChannel(history)
    channel.take(emitted => {
      expect(emitted).eqls({
        location: {
          pathname: '/hi',
          search: '',
          hash: '',
          state: undefined,
          key: emitted.location.key
        },
        action: 'PUSH'
      })
      done()
    })
    history.push('/hi')
  })
  it("emits END if cancelled", (done) => {
    const channel = historyChannel(fakeHistory)
    channel.take(doc => {
      expect(doc).eqls(END)
      done()
    })
    channel.close()
  })
})