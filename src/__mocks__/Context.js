const Context = {
  Provider: ({ value, children }) => {
    Context.value = value
    return children
  },
  value: null,
  Consumer: props => {
    return props.children(Context.value)
  }
}

export default Context
