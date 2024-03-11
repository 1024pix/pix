import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class AssessmentBanner extends Component {
  @tracked showClosingModal = false;

  @action toggleClosingModal() {
    this.showClosingModal = !this.showClosingModal;
  }
}
