import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class TubeRecommendationRowComponent extends Component {
  @tracked
  isOpen = false;

  @action
  toggleTutorialsSection() {
    this.isOpen = !this.isOpen;
  }
}
