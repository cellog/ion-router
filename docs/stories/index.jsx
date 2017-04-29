import React from 'react'
import * as storybook from '@kadira/storybook' // eslint-disable-line

import Browser from '../src/components/Browser'

storybook.storiesOf('Browser', module)
  .add('title bar', () => (
    <Browser
      url="/"
      back={storybook.action('back')}
      forward={storybook.action('forward')}
    />
  ))
