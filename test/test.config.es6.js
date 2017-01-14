const stuff = {
  output: {
    pathinfo: true
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [
      { test: /\.jsx?$/, loader: 'babel-loader', include: /(src|test)/ },
    ]
  },

  devtool: 'inline-source-map'
}

export default stuff
