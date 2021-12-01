import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class CandidateInList extends Component {
  @service notifications;

  @tracked isMenuOpen = false;
  @tracked isConfirmationModalDisplayed = false;

  @action
  async toggleCandidate(candidate) {
    await this.args.toggleCandidate(candidate);
  }

  @action
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @action
  closeMenu() {
    this.isMenuOpen = false;
  }

  @action
  askUserToConfirmTestResume() {
    this.isConfirmationModalDisplayed = true;
  }

  @action
  closeConfirmationModal() {
    this.isConfirmationModalDisplayed = false;
  }

  @action
  async authorizeTestResume() {
    await this.args.onCandidateTestResumeAuthorization();
    this.closeConfirmationModal();
    this.notifications.success(
      `Succès ! ${this.args.candidate.firstName} ${this.args.candidate.lastName} peut reprendre son test de certification.`,
    );
  }
}
