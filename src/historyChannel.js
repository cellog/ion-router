import { eventChannel, END } from 'redux-saga'

export default history => eventChannel(emit => {
  const unlisten = history.listen((location, action) => emit({ location, action }))
  return () => unlisten()
})
