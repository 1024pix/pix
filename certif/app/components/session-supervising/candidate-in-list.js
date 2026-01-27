import { action, set } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const Modals = {
  Confirmation: 'Confirmation',
  HandleLiveAlert: 'HandleLiveAlert',
  HandleCompanionLiveAlert: 'HandleCompanionLiveAlert',
  HandledLiveAlertSuccess: 'HandledLiveAlertSuccess',
};

const PIX_PLUS_DURATIONS = {
  DROIT: 60,
  PRO_SANTE: 60,
  EDU: 90,
};

export default class CandidateInList extends Component {
  @service dayjs;
  @service intl;
  @service pixToast;
  @service store;

  @tracked isMenuOpen = false;
  @tracked displayedModal = null;
  @tracked modalDescriptionText;
  @tracked modalCancelText;
  @tracked modalConfirmationText = this.intl.t('common.actions.confirm');
  @tracked modalInstructionText = this.intl.t('pages.session-supervising.candidate-in-list.default-modal-title');
  @tracked actionOnConfirmation;
  @tracked isLiveAlertValidated = false;

  get candidateFullName() {
    return `${this.args.candidate.firstName} ${this.args.candidate.lastName}`;
  }

  get formattedBirthdate() {
    if (!this.args.candidate.birthdate) return '';

    return this.dayjs.utc(this.args.candidate.birthdate).format('L');
  }

  get isConfirmButtonToBeDisplayed() {
    return !this.args.candidate.hasStarted && !this.args.candidate.hasCompleted;
  }

  get optionsMenuShouldBeDisplayed() {
    return this.args.candidate.hasStarted;
  }

  get shouldDisplayEnrolledComplementaryCertification() {
    return Boolean(this.enrolledCertificationLabel);
  }

  get shouldDisplayNonEligibilityWarning() {
    return this._isReconciliated() && this._isNotEligibleToEnrolledDoubleCertification();
  }

  _isNotEligibleToEnrolledDoubleCertification() {
    return (
      !this.args.candidate.isStillEligibleToDoubleCertification && this.args.candidate.enrolledDoubleCertificationLabel
    );
  }

  get enrolledCertificationLabel() {
    return (
      this.args.candidate.enrolledComplementaryCertificationLabel ??
      this.args.candidate.enrolledDoubleCertificationLabel
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
    return this.args.candidate.authorizedToStart ? 'transparent-dark' : 'primary';
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
    if (this.args.candidate.hasOngoingChallengeLiveAlert) {
      this.displayedModal = Modals.HandleLiveAlert;
    } else {
      this.pixToast.sendErrorNotification({
        message: this.intl.t(
          'pages.session-supervising.candidate-in-list.handle-live-alert-modal.no-current-live-alert',
        ),
      });
    }
  }

  @action
  askUserToHandleCompanionLiveAlert() {
    this.displayedModal = Modals.HandleCompanionLiveAlert;
  }

  @action
  async rejectLiveAlert() {
    try {
      const adapter = this.store.adapterFor('session-management');
      await adapter.dismissLiveAlert(this.args.sessionId, this.args.candidate.userId);
      this.isLiveAlertValidated = false;
      this.displayedModal = Modals.HandledLiveAlertSuccess;
    } catch {
      const errorMessage = this.intl.t(
        'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling.miscellaneous',
      );
      this.pixToast.sendErrorNotification({ message: errorMessage });
    }
  }

  @action
  async validateLiveAlert(subcategory) {
    try {
      const adapter = this.store.adapterFor('session-management');
      await adapter.validateLiveAlert({
        sessionId: this.args.sessionId,
        candidateId: this.args.candidate.userId,
        subcategory,
      });
      this.isLiveAlertValidated = true;
      this.displayedModal = Modals.HandledLiveAlertSuccess;
    } catch (err) {
      const errorMessage =
        err.errors[0].code === 'ALREADY_ANSWERED_ERROR'
          ? this.intl.t(
              'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling.challenge-already-answered',
            )
          : this.intl.t(
              'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling.miscellaneous',
            );
      this.pixToast.sendErrorNotification({ message: errorMessage });
    }
  }

  @action
  async clearedLiveAlert() {
    try {
      const adapter = this.store.adapterFor('session-management');
      await adapter.clearedLiveAlert({
        sessionId: this.args.sessionId,
        candidateUserId: this.args.candidate.userId,
      });

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.session-supervising.candidate-in-list.notifications.handling-live-alert.success', {
          htmlSafe: true,
        }),
      });
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t(
          'pages.session-supervising.candidate-in-list.handle-live-alert-modal.error-handling.miscellaneous',
        ),
      });
    } finally {
      this.displayedModal = null;
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
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.session-supervising.candidate-in-list.resume-test-modal.success', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        }),
      });
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
      this.pixToast.sendErrorNotification({ message: errorMessage });
    }
  }

  @action
  async endAssessmentForCandidate() {
    this.closeConfirmationModal();
    try {
      await this.args.onInvigilatorEndAssessment(this.args.candidate);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.session-supervising.candidate-in-list.test-end-modal.success', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        }),
      });
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.session-supervising.candidate-in-list.test-end-modal.error', {
          firstName: this.args.candidate.firstName,
          lastName: this.args.candidate.lastName,
        }),
      });
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

  get isHandleCompanionLiveAlertModalDisplayed() {
    return this.displayedModal === Modals.HandleCompanionLiveAlert;
  }

  get isLiveAlertHandledModalDisplayed() {
    return this.displayedModal === Modals.HandledLiveAlertSuccess;
  }

  get actionMethod() {
    return this.actionOnConfirmation;
  }

  get candidateStartTime() {
    const startTime = this.dayjs.self(this.args.candidate.startDateTime).format('HH:mm');
    return startTime;
  }

  get candidateTheoricalEndDateTime() {
    const pixPlusDuration = this._getPixPlusDurationInMinutes();

    if (pixPlusDuration !== null) {
      const endTime = this.dayjs.self(this.args.candidate.startDateTime).add(pixPlusDuration, 'minute').format('HH:mm');
      return endTime;
    }

    const theoricalEndDateTime = this.dayjs.self(this.args.candidate.theoricalEndDateTime).format('HH:mm');
    return theoricalEndDateTime;
  }

  _getPixPlusDurationInMinutes() {
    const label = this.enrolledCertificationLabel?.toLowerCase() || '';

    switch (true) {
      case label.includes('droit'):
        return PIX_PLUS_DURATIONS.DROIT;
      case label.includes('pro') && label.includes('santé'):
        return PIX_PLUS_DURATIONS.PRO_SANTE;
      case label.includes('édu'):
        return PIX_PLUS_DURATIONS.EDU;
      default:
        return null;
    }
  }

  get currentLiveAlertLabel() {
    const alertType = this.args.candidate.currentLiveAlert?.type;

    return this.intl.t(`common.forms.certification-labels.candidate-status.live-alerts.${alertType}.ongoing`);
  }
}
