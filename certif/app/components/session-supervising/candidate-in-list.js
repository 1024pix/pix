import { set } from '@ember/object';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import dayjs from 'dayjs';

export default class CandidateInList extends Component {
  @service notifications;

  @tracked isMenuOpen = false;
  @tracked isConfirmationModalDisplayed = false;
  @tracked modalDescriptionText;
  @tracked modalCancelText;
  @tracked modalConfirmationText;
  @tracked modalInstructionText = 'Information';
  @tracked actionOnConfirmation;
  @service intl;

  get isCheckboxToBeDisplayed() {
    return !this.args.candidate.hasStarted && !this.args.candidate.hasCompleted;
  }

  get optionsMenuShouldBeDisplayed() {
    return this.args.candidate.hasStarted;
  }

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
    this.modalDescriptionText = this.intl.t(
      'pages.session-supervising.candidate-in-list.resume-test-modal.description'
    );
    this.modalCancelText = this.intl.t('common.actions.close');
    this.modalConfirmationText = this.intl.t(
      'pages.session-supervising.candidate-in-list.resume-test-modal.actions.confirm'
    );
    this.modalInstructionText = this.intl.t(
      'pages.session-supervising.candidate-in-list.resume-test-modal.instruction-with-name',
      {
        firstName: this.args.candidate.firstName,
        lastName: this.args.candidate.lastName,
      }
    );
    set(this, 'actionOnConfirmation', this.authorizeTestResume);
    this.isConfirmationModalDisplayed = true;
  }

  @action
  askUserToConfirmTestEnd() {
    this.modalDescriptionText = this.intl.t('pages.session-supervising.candidate-in-list.test-end-modal.description');
    this.modalCancelText = this.intl.t('common.actions.cancel');
    this.modalConfirmationText = this.intl.t(
      'pages.session-supervising.candidate-in-list.test-end-modal.end-assessment'
    );
    this.modalInstructionText = this.intl.t(
      'pages.session-supervising.candidate-in-list.test-end-modal.instruction-with-name',
      {
        firstName: this.args.candidate.firstName,
        lastName: this.args.candidate.lastName,
      }
    );
    set(this, 'actionOnConfirmation', this.endAssessmentForCandidate);
    this.isConfirmationModalDisplayed = true;
  }

  @action
  closeConfirmationModal() {
    this.isConfirmationModalDisplayed = false;
  }

  @action
  async authorizeTestResume() {
    this.closeConfirmationModal();
    try {
      await this.args.onCandidateTestResumeAuthorization(this.args.candidate);
      this.notifications.success(
        this.intl.t('pages.session-supervising.candidate-in-list.resume-test-modal.success', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        })
      );
    } catch (error) {
      this.notifications.error(
        this.intl.t('pages.session-supervising.candidate-in-list.resume-test-modal.error', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        })
      );
    }
  }

  @action
  async endAssessmentForCandidate() {
    this.closeConfirmationModal();
    try {
      await this.args.onSupervisorEndAssessment(this.args.candidate);
      this.notifications.success(
        this.intl.t('pages.session-supervising.candidate-in-list.test-end-modal.success', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        })
      );
    } catch (error) {
      this.notifications.error(
        this.intl.t('pages.session-supervising.candidate-in-list.test-end-modal.error', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        })
      );
    }
  }

  get actionMethod() {
    return this.actionOnConfirmation;
  }

  get candidateStartTime() {
    const startTime = dayjs(this.args.candidate.startDateTime).format('HH:mm');
    return startTime;
  }
}
