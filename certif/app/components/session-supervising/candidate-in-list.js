import { action, set } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import dayjs from 'dayjs';

const Modals = {
  Confirmation: 'Confirmation',
  HandleLiveAlert: 'HandleLiveAlert',
  DismissLiveAlertSuccess: 'DismissLiveAlertSuccess',
  ValidateLiveAlertSuccess: 'ValidateLiveAlertSuccess',
};

export default class CandidateInList extends Component {
  @service notifications;
  @service intl;
  @service store;

  @tracked isMenuOpen = false;
  @tracked displayedModal = null;
  @tracked modalDescriptionText;
  @tracked modalCancelText;
  @tracked modalConfirmationText = this.intl.t('common.actions.confirm');
  @tracked modalInstructionText = this.intl.t('pages.session-supervising.candidate-in-list.default-modal-title');
  @tracked actionOnConfirmation;

  get candidateFullName() {
    const candidateFullName = `${this.args.candidate.firstName} ${this.args.candidate.lastName}`;
    return this.intl.t('pages.session-supervising.candidate-in-list.handle-live-alert-modal.title', {
      candidateFullName,
    });
  }

  get isConfirmButtonToBeDisplayed() {
    return !this.args.candidate.hasStarted && !this.args.candidate.hasCompleted;
  }

  get optionsMenuShouldBeDisplayed() {
    return this.args.candidate.hasStarted;
  }

  get shouldDisplayEnrolledComplementaryCertification() {
    return this.args.candidate.enrolledComplementaryCertificationLabel;
  }

  get shouldDisplayNonEligibilityWarning() {
    return this._isReconciliated() && this._isNotEligibleToEnrolledComplementaryCertification();
  }

  _isNotEligibleToEnrolledComplementaryCertification() {
    return (
      !this.args.candidate.isStillEligibleToComplementaryCertification &&
      this.args.candidate.enrolledComplementaryCertificationLabel
    );
  }

  _isReconciliated() {
    return this.args.candidate.userId;
  }

  get authorizationButtonLabel() {
    const confirm = this.intl.t('pages.session-supervising.candidate-in-list.actions.confirm.label');
    const cancel = this.intl.t('pages.session-supervising.candidate-in-list.actions.cancel-confirmation.label');

    return this.args.candidate.authorizedToStart ? cancel : confirm;
  }

  get authorizationButtonAriaLabel() {
    const candidateName = `${this.args.candidate.firstName} ${this.args.candidate.lastName}`;
    const confirmAriaLabel = this.intl.t(
      'pages.session-supervising.candidate-in-list.actions.confirm.extra-information',
      {
        candidate: candidateName,
      },
    );
    const cancelAriaLabel = this.intl.t(
      'pages.session-supervising.candidate-in-list.actions.cancel-confirmation.extra-information',
      {
        candidate: candidateName,
      },
    );

    return this.args.candidate.authorizedToStart ? cancelAriaLabel : confirmAriaLabel;
  }

  get authorizationButtonBackgroundColor() {
    return this.args.candidate.authorizedToStart ? 'transparent-dark' : 'blue';
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
      'pages.session-supervising.candidate-in-list.resume-test-modal.description',
    );
    this.modalCancelText = this.intl.t('common.actions.close');
    this.modalConfirmationText = this.intl.t(
      'pages.session-supervising.candidate-in-list.resume-test-modal.actions.confirm',
    );
    this.modalInstructionText = this.intl.t(
      'pages.session-supervising.candidate-in-list.resume-test-modal.instruction-with-name',
      {
        firstName: this.args.candidate.firstName,
        lastName: this.args.candidate.lastName,
      },
    );
    set(this, 'actionOnConfirmation', this.authorizeTestResume);
    this.displayedModal = Modals.Confirmation;
  }

  @action
  askUserToConfirmTestEnd() {
    this.modalDescriptionText = this.intl.t('pages.session-supervising.candidate-in-list.test-end-modal.description');
    this.modalCancelText = this.intl.t('common.actions.cancel');
    this.modalConfirmationText = this.intl.t(
      'pages.session-supervising.candidate-in-list.test-end-modal.end-assessment',
    );
    this.modalInstructionText = this.intl.t(
      'pages.session-supervising.candidate-in-list.test-end-modal.instruction-with-name',
      {
        firstName: this.args.candidate.firstName,
        lastName: this.args.candidate.lastName,
      },
    );
    set(this, 'actionOnConfirmation', this.endAssessmentForCandidate);
    this.displayedModal = Modals.Confirmation;
  }

  @action
  askUserToHandleLiveAlert() {
    if (this._hasCertificationOngoingLiveAlert) {
      this.displayedModal = Modals.HandleLiveAlert;
    } else {
      this.notifications.error(
        this.intl.t('pages.session-supervising.candidate-in-list.handle-live-alert-modal.no-current-live-alert'),
      );
    }
  }

  @action
  async rejectLiveAlert() {
    try {
      const adapter = this.store.adapterFor('session');
      await adapter.dismissLiveAlert(this.args.sessionId, this.args.candidate.userId);
      this.displayedModal = Modals.DismissLiveAlertSuccess;
    } catch (err) {
      const errorMessage = this.intl.t(
        'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling-live-alert',
      );
      this.notifications.error(errorMessage);
    }
  }

  @action
  async validateLiveAlert(subcategory) {
    try {
      const adapter = this.store.adapterFor('session');
      await adapter.validateLiveAlert({
        sessionId: this.args.sessionId,
        candidateId: this.args.candidate.userId,
        subcategory,
      });
      this.displayedModal = Modals.ValidateLiveAlertSuccess;
    } catch (err) {
      const errorMessage = this.intl.t(
        'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling-live-alert',
      );
      this.notifications.error(errorMessage);
    }
  }

  @action
  closeConfirmationModal() {
    this.displayedModal = null;
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
        }),
      );
    } catch (responseError) {
      const error = responseError?.errors?.[0];
      const parameters = {
        firstName: this.args.candidate.firstName,
        lastName: this.args.candidate.lastName,
      };

      let errorMessage;

      if (error?.code) {
        errorMessage = this.intl.t(`common.api-error-messages.${error.code}`, parameters);
      } else {
        errorMessage = this.intl.t('common.api-error-messages.authorize-resume-error', parameters);
      }
      this.notifications.error(errorMessage);
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
        }),
      );
    } catch (error) {
      this.notifications.error(
        this.intl.t('pages.session-supervising.candidate-in-list.test-end-modal.error', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        }),
      );
    }
  }

  @action closeHandleLiveAlertModal() {
    this.displayedModal = null;
  }

  get isConfirmationModalDisplayed() {
    return this.displayedModal === Modals.Confirmation;
  }

  get isHandleLiveAlertModalDisplayed() {
    return this.displayedModal === Modals.HandleLiveAlert;
  }

  get isLiveAlertRejectedModalDisplayed() {
    return this.displayedModal === Modals.DismissLiveAlertSuccess;
  }

  get isLiveAlertValidatedModalDisplayed() {
    return this.displayedModal === Modals.ValidateLiveAlertSuccess;
  }

  get actionMethod() {
    return this.actionOnConfirmation;
  }

  get candidateStartTime() {
    const startTime = dayjs(this.args.candidate.startDateTime).format('HH:mm');
    return startTime;
  }

  get candidateTheoricalEndDateTime() {
    const theoricalEndDateTime = dayjs(this.args.candidate.theoricalEndDateTime).format('HH:mm');
    return theoricalEndDateTime;
  }

  get _hasCertificationOngoingLiveAlert() {
    return this.args.candidate.liveAlertStatus === 'ongoing';
  }
}
