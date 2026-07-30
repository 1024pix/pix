import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { action, set } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import t from 'ember-intl/helpers/t';
import Content from 'pix-certif/components/dropdown/content';
import Item from 'pix-certif/components/dropdown/item';
import CompanionLiveAlertModal from 'pix-certif/components/session-supervising/companion-live-alert-modal';
import ConfirmationModal from 'pix-certif/components/session-supervising/confirmation-modal';
import HandleLiveAlertModal from 'pix-certif/components/session-supervising/handle-live-alert-modal';
import LiveAlertHandledModal from 'pix-certif/components/session-supervising/live-alert-handled-modal';
import formatPercentage from 'pix-certif/helpers/format-percentage';

import dayjsUtcFormatHelper from '../../helpers/dayjs-utc-format';

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
  @service pixToast;
  @service intl;
  @service store;

  @tracked isMenuOpen = false;
  @tracked displayedModal = null;
  @tracked modalDescriptionText;
  @tracked modalCancelText;
  @tracked modalConfirmationText = this.intl.t('common.actions.confirm');
  @tracked modalInstructionText = this.intl.t('pages.session-supervising.candidate-in-list.default-modal-title');
  @tracked actionOnConfirmation;
  @tracked isLiveAlertValidated = false;

  get isOvertime() {
    if (this.args.candidate.hasCompleted) {
      return false;
    }
    if (this.args.candidate.hasStarted) {
      return this.args.candidate.hasExceededCertificationDuration;
    }
    return this.args.hasSessionExpired;
  }

  get candidateCanStart() {
    return this.args.candidate.hasNotStarted && !this.args.hasSessionExpired;
  }

  get candidateFullName() {
    return `${this.args.candidate.firstName} ${this.args.candidate.lastName}`;
  }

  get optionsMenuShouldBeDisplayed() {
    return this.args.candidate.hasStarted;
  }

  get shouldDisplayEnrolledComplementaryCertification() {
    return this.args.candidate.subscription !== 'CORE';
  }

  get shouldDisplayNonEligibilityWarning() {
    return this._isReconciliated() && this._isNotEligibleToEnrolledDoubleCertification();
  }

  get subscriptionLabel() {
    return this.intl.t(`pages.session-supervising.candidate-in-list.subscriptions.${this.args.candidate.subscription}`);
  }

  get authorizationToStartButtonLabel() {
    const key = this.args.candidate.authorizedToStart ? 'cancel-confirmation' : 'confirm';
    return this.intl.t(`pages.session-supervising.candidate-in-list.actions.${key}.label`);
  }

  get authorizationToStartButtonAriaLabel() {
    const key = this.args.candidate.authorizedToStart ? 'cancel-confirmation' : 'confirm';
    return this.intl.t(`pages.session-supervising.candidate-in-list.actions.${key}.extra-information`, {
      candidate: this.candidateFullName,
    });
  }

  get authorizationToStartButtonBackgroundColor() {
    return this.args.candidate.authorizedToStart ? 'transparent-dark' : 'primary';
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
    return dayjs(this.args.candidate.startDateTime).format('HH:mm');
  }

  get candidateTheoricalEndDateTime() {
    const pixPlusDuration = this._getPixPlusDurationInMinutes(); // todo should be removed ?

    if (pixPlusDuration !== null) {
      return dayjs(this.args.candidate.startDateTime).add(pixPlusDuration, 'minute').format('HH:mm');
    }

    return dayjs(this.args.candidate.theoricalEndDateTime).format('HH:mm');
  }

  get currentLiveAlertLabel() {
    const alertType = this.args.candidate.currentLiveAlert?.type;

    return this.intl.t(`common.forms.certification-labels.candidate-status.live-alerts.${alertType}.ongoing`);
  }

  _isNotEligibleToEnrolledDoubleCertification() {
    return (
      !this.args.candidate.isStillEligibleToDoubleCertification && this.args.candidate.isEnrolledToDoubleCertification
    );
  }

  _isReconciliated() {
    return this.args.candidate.userId;
  }

  _getPixPlusDurationInMinutes() {
    switch (this.args.candidate.subscription) {
      case 'DROIT':
        return PIX_PLUS_DURATIONS.DROIT;
      case 'PRO_SANTE':
        return PIX_PLUS_DURATIONS.PRO_SANTE;
      case 'EDU_1ER_DEGRE':
      case 'EDU_2ND_DEGRE':
      case 'EDU_CPE':
        return PIX_PLUS_DURATIONS.EDU;
      default:
        return null;
    }
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
    } catch (err) {
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

  <template>
    <li class='session-supervising-candidate-in-list'>
      <div class='session-supervising-candidate-in-list__candidate-data'>
        <div class='session-supervising-candidate-in-list__status'>
          {{#if this.isOvertime}}
            <PixTag @color='blue'>{{t
                'common.forms.certification-labels.candidate-status.certification-overtime'
              }}</PixTag>
          {{/if}}
          {{#if @candidate.hasCompleted}}
            <PixTag @color='blue'>{{t 'common.forms.certification-labels.candidate-status.finished'}}</PixTag>
          {{/if}}
          {{#if @candidate.isPlaying}}
            {{#if @candidate.currentLiveAlert}}
              <PixTag @color='error'>
                {{this.currentLiveAlertLabel}}
              </PixTag>
              <PixTag @color='yellow'>
                {{t 'common.forms.certification-labels.candidate-status.on-hold'}}
              </PixTag>
            {{else}}
              <PixTag @color='green'>
                {{t 'common.forms.certification-labels.candidate-status.ongoing'}}
              </PixTag>
            {{/if}}
          {{/if}}
        </div>
        <div class='session-supervising-candidate-in-list__infos'>
          <div class='session-supervising-candidate-in-list__top-information'>
            <div class='session-supervising-candidate-in-list__full-name'>
              {{@candidate.lastName}}
              {{@candidate.firstName}}
            </div>
          </div>

          <div class='session-supervising-candidate-in-list__middle-information'>
            <p>{{dayjsUtcFormatHelper @candidate.birthdate 'DD/MM/YYYY'}}</p>
            {{#if this.shouldDisplayEnrolledComplementaryCertification}}
              <p class='session-supervising-candidate-in-list-details__enrolment'>
                <PixIcon
                  @name='awards'
                  @ariaHidden={{true}}
                  class='session-supervising-candidate-in-list-details-enrolment__icon'
                />
                {{t
                  'pages.session-supervising.candidate-in-list.complementary-certification-enrolment'
                  complementaryCertification=this.subscriptionLabel
                }}
              </p>
            {{/if}}
            {{#if this.shouldDisplayNonEligibilityWarning}}
              <PixNotificationAlert @type='warning' @withIcon={{true}}>
                {{t 'pages.session-supervising.candidate-in-list.double-certification-non-eligibility-warning'}}
              </PixNotificationAlert>
            {{/if}}
          </div>

          {{#if @candidate.isPlaying}}
            <div class='session-supervising-candidate-in-list__bottom-information'>
              <div class='session-supervising-candidate-in-list-details-time'>
                <div class='session-supervising-candidate-in-list-details-time__text'>
                  <PixIcon
                    @name='time'
                    @ariaHidden={{true}}
                    class='session-supervising-candidate-in-list-details-time__clock'
                  />
                  <span>
                    {{t 'pages.session-supervising.candidate-in-list.start-date-time'}}
                    <time>{{this.candidateStartTime}}</time>
                  </span>
                  <span class='session-supervising-candidate-in-list-details-time__text__end-date-time'>
                    {{t 'pages.session-supervising.candidate-in-list.end-date-time'}}
                    <time>{{this.candidateTheoricalEndDateTime}}</time>
                  </span>
                </div>
                {{#if @candidate.extraTimePercentage}}
                  <PixTag @color='grey'>
                    {{t
                      'pages.session-supervising.candidate-in-list.extratime'
                      extraTimePercentage=(formatPercentage @candidate.extraTimePercentage)
                    }}
                  </PixTag>
                {{/if}}
              </div>
            </div>
          {{/if}}

          {{#if @candidate.hasOngoingChallengeLiveAlert}}
            <PixButton
              @triggerAction={{this.askUserToHandleLiveAlert}}
              @variant='error'
              class='session-supervising-candidate-in-list__live-alert-button'
            >
              {{t 'pages.session-supervising.candidate-in-list.resume-test-modal.live-alerts.handle-challenge'}}
            </PixButton>
          {{/if}}

          {{#if this.candidateCanStart}}
            <PixButton
              aria-label={{this.authorizationToStartButtonAriaLabel}}
              @triggerAction={{fn this.toggleCandidate @candidate}}
              @variant={{this.authorizationToStartButtonBackgroundColor}}
              @isBorderVisible={{@candidate.authorizedToStart}}
              class='session-supervising-candidate-in-list__confirm-button'
            >
              {{this.authorizationToStartButtonLabel}}
            </PixButton>
          {{/if}}
        </div>
      </div>

      {{#if this.optionsMenuShouldBeDisplayed}}
        <div class='session-supervising-candidate-in-list__menu'>
          <PixIconButton
            @size='small'
            @iconName='moreVert'
            @ariaLabel={{t 'pages.session-supervising.candidate-in-list.display-candidate-options'}}
            @triggerAction={{this.toggleMenu}}
          />
          <Content
            @display={{this.isMenuOpen}}
            @close={{this.closeMenu}}
            aria-label={{t 'pages.session-supervising.candidate-in-list.candidate-options'}}
          >
            {{#if @candidate.isPlaying}}
              {{#if @candidate.hasOngoingCompanionLiveAlert}}
                <Item @onClick={{this.askUserToHandleCompanionLiveAlert}}>
                  {{t 'pages.session-supervising.candidate-in-list.resume-test-modal.live-alerts.handle-companion'}}
                </Item>
              {{/if}}

              <Item @onClick={{this.askUserToConfirmTestResume}}>
                {{t 'pages.session-supervising.candidate-in-list.resume-test-modal.allow-test-resume'}}
              </Item>
            {{/if}}

            <Item @onClick={{this.askUserToConfirmTestEnd}}>
              {{t 'pages.session-supervising.candidate-in-list.test-end-modal.end-assessment'}}
            </Item>
          </Content>
        </div>
      {{/if}}

      <ConfirmationModal
        @showModal={{this.isConfirmationModalDisplayed}}
        @closeConfirmationModal={{this.closeConfirmationModal}}
        @actionOnConfirmation={{this.actionMethod}}
        @candidate={{this.args.candidate}}
        @modalCancelText={{this.modalCancelText}}
        @modalConfirmationButtonText={{this.modalConfirmationText}}
        @title={{this.modalInstructionText}}
      >
        <:description>
          {{this.modalDescriptionText}}
        </:description>
      </ConfirmationModal>

      {{#if @candidate.hasOngoingChallengeLiveAlert}}
        <HandleLiveAlertModal
          @showModal={{this.isHandleLiveAlertModalDisplayed}}
          @closeConfirmationModal={{this.closeHandleLiveAlertModal}}
          @title={{this.candidateFullName}}
          @rejectLiveAlert={{this.rejectLiveAlert}}
          @validateLiveAlert={{this.validateLiveAlert}}
          @candidateId={{@candidate.id}}
          @liveAlert={{@candidate.challengeLiveAlert}}
        />
      {{/if}}

      <LiveAlertHandledModal
        @showModal={{this.isLiveAlertHandledModalDisplayed}}
        @closeConfirmationModal={{this.closeHandleLiveAlertModal}}
        @candidateFullName={{this.candidateFullName}}
        @isLiveAlertValidated={{this.isLiveAlertValidated}}
      />

      <CompanionLiveAlertModal
        @showModal={{this.isHandleCompanionLiveAlertModalDisplayed}}
        @closeConfirmationModal={{this.closeHandleLiveAlertModal}}
        @candidateFullName={{this.candidateFullName}}
        @clearedLiveAlert={{this.clearedLiveAlert}}
      />

    </li>
  </template>
}
