/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('learning-more-panel')
export default class LearningMorePanel extends Component {
  learningMoreTutorials = null;

  @computed('learningMoreTutorials.length')
  get hasLearningMoreItems() {
    const learningMoreTutorials = this.learningMoreTutorials || [];

    return learningMoreTutorials.length > 0;
  }
}
