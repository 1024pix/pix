import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import EmberObject, { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import get from 'lodash/get';
import toNumber from 'lodash/toNumber';
import { SUBSCRIPTION_TYPES } from 'pix-certif/models/subscription';

import { formatPercentage } from '../../../../helpers/format-percentage';
import CandidateCreationModal from './candidate-creation-modal';
import CandidateDetailsModal from './candidate-details-modal';
import CandidateEditionModal from './candidate-edition-modal';

const TRANSLATE_PREFIX = 'pages.sessions.detail.candidates';

export default class EnrolledCandidates extends Component {
  @service store;
  @service intl;
  @service currentUser;
  @service pixToast;
  @service featureToggles;
  @tracked newCandidate = {};
  @tracked shouldDisplayCertificationCandidateModal = false;
  @tracked shouldDisplayEditCertificationCandidateModal = false;
  @tracked certificationCandidateInDetailsModal = null;
  @tracked certificationCandidateInEditModal = null;
  @tracked showNewCandidateModal = false;

  get shouldDisplayAccessibilityAdjustmentNeededFeature() {
    return this.featureToggles.featureToggles?.isNeedToAdjustCertificationAccessibilityEnabled;
  }

  get caption() {
    if (this.args.shouldDisplayScoStudentRegistration) {
      return this.intl.t('pages.sessions.detail.candidates.list.without-details-description');
    }
    return this.intl.t('pages.sessions.detail.candidates.list.with-details-description');
  }

  @action
  formattedCandidateExtratimePercentage(value) {
    return value ? formatPercentage([value]) : '-';
  }

  @action
  async deleteCertificationCandidate(certificationCandidate) {
    const sessionId = this.args.sessionId;

    try {
      await certificationCandidate.destroyRecord({ adapterOptions: { sessionId } });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.success-remove`),
      });
    } catch (error) {
      let errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.error-remove-unknown`);
      if (get(error, 'errors[0].code') === 403) {
        errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.error-remove-already-in`);
      }
      this.pixToast.sendErrorNotification({ message: errorText });
    }
  }

  @action
  addCertificationCandidateInStaging() {
    let addedAttributes = {};
    if (this.args.shouldDisplayPaymentOptions) {
      addedAttributes = {
        billingMode: '',
        prepaymentCode: '',
      };
    }
    this.newCandidate = EmberObject.create({
      firstName: '',
      lastName: '',
      birthdate: '',
      birthCity: '',
      birthCountry: 'FRANCE',
      email: '',
      externalId: '',
      resultRecipientEmail: '',
      birthPostalCode: '',
      birthInseeCode: '',
      sex: '',
      extraTimePercentage: '',
      subscriptions: [],
      ...addedAttributes,
    });
  }

  @action
  async addCertificationCandidate(candidate) {
    const certificationCandidate = { ...candidate };
    certificationCandidate.extraTimePercentage = this._fromPercentageStringToDecimal(candidate.extraTimePercentage);
    const success = await this.saveCertificationCandidate(certificationCandidate);
    if (success) {
      this.closeNewCandidateModal();
    }
    return success;
  }

  @action
  updateCertificationCandidateInStagingFieldFromEvent(candidateInStaging, field, ev) {
    const { value } = ev.target;

    candidateInStaging.set(field, value);
  }

  @action
  updateCertificationCandidateInStagingFieldFromValue(candidateInStaging, field, value) {
    candidateInStaging.set(field, value);
  }

  @action
  updateEditCandidateInStagingFieldFromValue(candidateInStaging, field, event) {
    candidateInStaging.set(field, event.target.checked);
  }

  @action
  async updateCandidate(event) {
    event.preventDefault();
    try {
      const adapter = this.store.adapterFor('certification-candidate');
      await adapter.updateRecord({ candidate: this.certificationCandidateInEditModal, sessionId: this.args.sessionId });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.sessions.detail.candidates.edit-modal.notifications.success'),
      });
      this.closeEditCandidateModal();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.sessions.detail.candidates.edit-modal.notifications.error'),
      });
    } finally {
      this.args.reloadCertificationCandidate();
    }
  }

  @action
  updateCertificationCandidateInStagingBirthdate(candidateInStaging, value) {
    candidateInStaging.set('birthdate', value);
  }

  @action
  async saveCertificationCandidate(certificationCandidateData) {
    const { certificationCandidate, subscriptions } =
      this._createCertificationCandidateRecord(certificationCandidateData);

    if (this._hasDuplicate(certificationCandidate)) {
      this._handleDuplicateError(certificationCandidate);
      return;
    }

    try {
      await certificationCandidate.save({
        adapterOptions: { registerToSession: true, sessionId: this.args.sessionId, subscriptions },
      });
      this.args.reloadCertificationCandidate();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.success-add`),
      });
      return true;
    } catch (errorResponse) {
      const status = get(errorResponse, 'errors[0].status');

      const errorText = this._getErrorText({ status, errorResponse });
      this._handleSavingError({ errorText, certificationCandidate });
      return false;
    }
  }

  @action
  openCertificationCandidateDetailsModal(candidate) {
    this.shouldDisplayCertificationCandidateModal = true;
    this.certificationCandidateInDetailsModal = candidate;
  }

  @action
  openEditCertificationCandidateDetailsModal(candidate) {
    this.shouldDisplayEditCertificationCandidateModal = true;
    this.certificationCandidateInEditModal = candidate;
  }

  @action
  closeCertificationCandidateDetailsModal() {
    this.shouldDisplayCertificationCandidateModal = false;
    this.certificationCandidateInDetailsModal = null;
  }

  @action
  openNewCandidateModal() {
    this.addCertificationCandidateInStaging();
    this.showNewCandidateModal = true;
  }

  @action
  closeNewCandidateModal() {
    this.showNewCandidateModal = false;
  }

  @action
  closeEditCandidateModal() {
    this.shouldDisplayEditCertificationCandidateModal = false;
  }

  _createCertificationCandidateRecord(certificationCandidateData) {
    const subscriptions = certificationCandidateData.subscriptions;
    delete certificationCandidateData.subscriptions;
    if (
      !this.currentUser.currentAllowedCertificationCenterAccess.isCoreComplementaryCompatibilityEnabled ||
      subscriptions.length === 0
    ) {
      subscriptions.push({
        type: SUBSCRIPTION_TYPES.CORE,
        complementaryCertificationId: null,
      });
    }
    return {
      subscriptions,
      certificationCandidate: this.store.createRecord('certification-candidate', certificationCandidateData),
    };
  }

  _getErrorText({ status, errorResponse }) {
    switch (status) {
      case '409':
        return this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.error-add-duplicate`);
      case '422':
        return this._handleEntityValidationError(errorResponse);
      case '400':
        return this._handleMissingQueryParamError(errorResponse);
      case '403':
        return this._handleApiError(errorResponse);
      default:
        return this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.error-add-unknown`);
    }
  }

  _handleEntityValidationError(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.code) {
      return this.intl.t(`common.api-error-messages.certification-candidate.${error.code}`, {
        ...error?.meta,
      });
    }
  }

  _handleApiError(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.code) {
      return this.intl.t(`common.api-error-messages.${error.code}`, {
        ...error?.meta,
      });
    }
  }

  _handleMissingQueryParamError(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.detail === 'CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID') {
      return this.intl.t(`common.api-error-messages.certification-candidate.${error.detail}`);
    }
  }

  _handleSavingError({ errorText, certificationCandidate }) {
    const error = errorText ?? this.intl.t(`common.api-error-messages.internal-server-error`);
    this.pixToast.sendErrorNotification({ message: error });
    certificationCandidate.deleteRecord();
  }

  _handleDuplicateError(certificationCandidate) {
    const errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.error-add-duplicate`);
    this._handleSavingError({ errorText, certificationCandidate });
  }

  _fromPercentageStringToDecimal(value) {
    return value ? toNumber(value) / 100 : value;
  }

  _hasDuplicate(certificationCandidate) {
    const currentFirstName = certificationCandidate.firstName;
    const currentLastName = certificationCandidate.lastName;
    const currentBirthdate = certificationCandidate.birthdate;

    return (
      this.args.certificationCandidates.find(
        ({ lastName, firstName, birthdate }) =>
          lastName.toLowerCase() === currentLastName.toLowerCase() &&
          firstName.toLowerCase() === currentFirstName.toLowerCase() &&
          birthdate === currentBirthdate,
      ) !== undefined
    );
  }

  get showCompatibilityTooltip() {
    return this.currentUser.currentAllowedCertificationCenterAccess.isCoreComplementaryCompatibilityEnabled;
  }

  computeSubscriptionsText = (candidate) => {
    const complementaryCertificationList = this.args.complementaryCertifications ?? [];
    const subscriptionLabels = [];

    if (candidate.hasDualCertificationSubscriptionCoreClea(complementaryCertificationList)) {
      subscriptionLabels.push(this.intl.t(`${TRANSLATE_PREFIX}.list.subscriptions.dual-core-clea`));
    } else {
      for (const subscription of candidate.subscriptions) {
        if (subscription.isCore) subscriptionLabels.unshift(this.intl.t(`${TRANSLATE_PREFIX}.list.subscriptions.core`));
        else {
          const candidateComplementaryCertification = complementaryCertificationList.find(
            (complementaryCertification) => complementaryCertification.id === subscription.complementaryCertificationId,
          );
          subscriptionLabels.push(candidateComplementaryCertification?.label || '-');
        }
      }
    }

    return subscriptionLabels.join(', ');
  };
  <template>
    <header class='panel-header'>
      <h3 class='panel-header__title'>
        {{t 'pages.sessions.detail.candidates.list.title'}}
        ({{@certificationCandidates.length}})
      </h3>
      {{#if @shouldDisplayScoStudentRegistration}}
        <PixButtonLink @route='authenticated.sessions.add-student' @model={{@sessionId}}>
          {{t 'pages.sessions.detail.candidates.list.actions.inscription-multiple.label'}}
        </PixButtonLink>
      {{else}}
        <PixButton id='add-candidate' @triggerAction={{this.openNewCandidateModal}} @size='small'>
          {{t 'pages.sessions.detail.candidates.list.actions.inscription.label'}}
        </PixButton>
      {{/if}}
    </header>
    {{#if @certificationCandidates}}
      <PixTable @data={{@certificationCandidates}} @variant='certif' @caption={{this.caption}}>
        <:columns as |candidate context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'common.labels.candidate.birth-name'}}
            </:header>
            <:cell>
              {{candidate.lastName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'common.labels.candidate.firstname'}}
            </:header>
            <:cell>
              {{candidate.firstName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class='table__column--small'>
            <:header>
              {{t 'common.labels.candidate.birth-date'}}
            </:header>
            <:cell>
              {{dayjsFormat candidate.birthdate 'DD/MM/YYYY'}}
            </:cell>
          </PixTableColumn>
          {{#if @shouldDisplayScoStudentRegistration}}
            <PixTableColumn @context={{context}}>
              <:header>
                {{t 'common.labels.candidate.birth-city'}}
              </:header>
              <:cell>
                {{candidate.birthCity}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>
                {{t 'common.labels.candidate.birth-country'}}
              </:header>
              <:cell>
                {{candidate.birthCountry}}
              </:cell>
            </PixTableColumn>
          {{/if}}
          {{#unless @shouldDisplayScoStudentRegistration}}
            <PixTableColumn @context={{context}} class='table__column'>
              <:header>
                {{t 'common.forms.certification-labels.email-results'}}
              </:header>
              <:cell>
                {{candidate.resultRecipientEmail}}
              </:cell>
            </PixTableColumn>
          {{/unless}}
          <PixTableColumn @context={{context}} class='table__column--small'>
            <:header>
              {{t 'common.forms.certification-labels.extratime'}}
            </:header>
            <:cell>
              {{this.formattedCandidateExtratimePercentage candidate.extraTimePercentage}}
            </:cell>
          </PixTableColumn>
          {{#if this.shouldDisplayAccessibilityAdjustmentNeededFeature}}
            <PixTableColumn @context={{context}} class='table__column--small'>
              <:header>
                {{t 'common.forms.certification-labels.accessibility'}}
              </:header>
              <:cell>
                {{candidate.accessibilityAdjustmentNeededLabel}}
              </:cell>
            </PixTableColumn>
          {{/if}}
          <PixTableColumn @context={{context}} class='table__column'>
            <:header>
              <span class='certification-candidates-table__selected-subscriptions'>
                {{t 'common.forms.certification-labels.selected-subscriptions'}}
                {{#if this.showCompatibilityTooltip}}
                  <PixTooltip @id='tooltip-compatibility-subscription' @position='bottom' @isWide={{true}}>
                    <:triggerElement>
                      <PixIcon
                        @plainIcon={{true}}
                        @name='info'
                        tabindex='0'
                        aria-describedby='tooltip-compatibility-subscription'
                      />
                    </:triggerElement>
                    <:tooltip>
                      {{t 'pages.sessions.detail.candidates.list.compatibility-tooltip'}}
                    </:tooltip>
                  </PixTooltip>
                {{/if}}
              </span>
            </:header>
            <:cell>
              {{this.computeSubscriptionsText candidate}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Actions
            </:header>
            <:cell>
              <div class='certification-candidates-actions'>
                {{#unless @shouldDisplayScoStudentRegistration}}
                  <PixButton
                    @variant='tertiary'
                    @triggerAction={{fn this.openCertificationCandidateDetailsModal candidate}}
                    aria-label='{{t
                      "pages.sessions.detail.candidates.list.actions.details.extra-information"
                    }} {{candidate.firstName}} {{candidate.lastName}}'
                  >
                    {{t 'pages.sessions.detail.candidates.list.actions.details.label'}}
                  </PixButton>
                {{/unless}}
                {{#if this.shouldDisplayAccessibilityAdjustmentNeededFeature}}
                  {{#if candidate.isLinked}}
                    <PixTooltip @position='left' @isInline={{true}} @id='tooltip-edit-student-button'>
                      <:triggerElement>
                        <PixIconButton
                          @iconName='edit'
                          @plainIcon={{true}}
                          @ariaLabel='{{t
                            "pages.sessions.detail.candidates.list.actions.edit.extra-information"
                          }} {{candidate.firstName}} {{candidate.lastName}}'
                          disabled
                          aria-describedby='tooltip-edit-student-button'
                        />
                      </:triggerElement>
                      <:tooltip>{{t 'pages.sessions.detail.candidates.list.actions.edit.tooltip'}}</:tooltip>
                    </PixTooltip>
                  {{else}}
                    <PixIconButton
                      @iconName='edit'
                      @plainIcon={{true}}
                      {{on 'click' (fn this.openEditCertificationCandidateDetailsModal candidate)}}
                      @ariaLabel='{{t
                        "pages.sessions.detail.candidates.list.actions.edit.extra-information"
                      }} {{candidate.firstName}} {{candidate.lastName}}'
                    />
                  {{/if}}
                {{/if}}
                {{#if candidate.isLinked}}
                  <PixTooltip @position='left' @isInline={{true}} @id='tooltip-delete-student-button'>
                    <:triggerElement>
                      <PixIconButton
                        @iconName='delete'
                        @plainIcon={{true}}
                        @ariaLabel='{{t
                          "pages.sessions.detail.candidates.list.actions.delete.extra-information"
                        }} {{candidate.firstName}} {{candidate.lastName}}'
                        disabled
                        aria-describedby='tooltip-delete-student-button'
                      />
                    </:triggerElement>
                    <:tooltip>{{t 'pages.sessions.detail.candidates.list.actions.delete.tooltip'}}</:tooltip>
                  </PixTooltip>
                {{else}}
                  <PixIconButton
                    @iconName='delete'
                    @plainIcon={{true}}
                    {{on 'click' (fn this.deleteCertificationCandidate candidate)}}
                    @ariaLabel='{{t
                      "pages.sessions.detail.candidates.list.actions.delete.extra-information"
                    }} {{candidate.firstName}} {{candidate.lastName}}'
                  />
                {{/if}}
              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <div class='table__empty content-text'>
        <p>{{t 'pages.sessions.detail.candidates.list.empty'}}</p>
      </div>
    {{/if}}

    {{#if this.shouldDisplayCertificationCandidateModal}}
      <CandidateDetailsModal
        @showModal={{this.shouldDisplayCertificationCandidateModal}}
        @closeModal={{this.closeCertificationCandidateDetailsModal}}
        @candidate={{this.certificationCandidateInDetailsModal}}
        @complementaryCertifications={{@complementaryCertifications}}
        @shouldDisplayPaymentOptions={{@shouldDisplayPaymentOptions}}
      />
    {{/if}}

    <CandidateCreationModal
      @showModal={{this.showNewCandidateModal}}
      @closeModal={{this.closeNewCandidateModal}}
      @countries={{@countries}}
      @saveCandidate={{this.addCertificationCandidate}}
      @candidateData={{this.newCandidate}}
      @updateCandidateData={{this.updateCertificationCandidateInStagingFieldFromEvent}}
      @updateCandidateDataFromValue={{this.updateCertificationCandidateInStagingFieldFromValue}}
      @shouldDisplayPaymentOptions={{@shouldDisplayPaymentOptions}}
    />

    <CandidateEditionModal
      @showModal={{this.shouldDisplayEditCertificationCandidateModal}}
      @closeModal={{this.closeEditCandidateModal}}
      @candidate={{this.certificationCandidateInEditModal}}
      @updateCandidateDataFromValue={{this.updateEditCandidateInStagingFieldFromValue}}
      @updateCandidate={{this.updateCandidate}}
    />
  </template>
}
