import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class TubeRecommendationRowComponent extends Component {
  @tracked
  isOpen = false;

  @action
  toggleTutorialsSection() {
    this.isOpen = !this.isOpen;
  }
}
