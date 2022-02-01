import Component from '@glimmer/component';

export default class LearningMorePanel extends Component {
  get hasLearningMoreItems() {
    const learningMoreTutorials = this.args.learningMoreTutorials || [];
    return learningMoreTutorials.length > 0;
  }
}
