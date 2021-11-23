import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import noop from 'lodash/noop';

export default class CandidateInList extends Component {
  @tracked isMenuOpen = false;

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }

  @action
  allowTestResume() {
    noop();
  }

  @action
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }
}
