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
    return this.learningMoreTutorials.length > 0;
  }
}
