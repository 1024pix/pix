import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class LearningMorePanel extends Component {
  @service featureToggles;

  get hasLearningMoreItems() {
    const learningMoreTutorials = this.args.learningMoreTutorials || [];
    return learningMoreTutorials.length > 0;
  }
}
