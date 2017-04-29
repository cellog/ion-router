import { configure } from '@kadira/storybook';

function loadStories() {
  require('../stories/index');
}

configure(loadStories, module);
