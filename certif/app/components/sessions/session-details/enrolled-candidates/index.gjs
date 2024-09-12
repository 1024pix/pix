import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import EmberObject, { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';
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
  @service notifications;
  @service featureToggles;
  @tracked candidatesInStaging = [];
  @tracked newCandidate = {};
  @tracked shouldDisplayCertificationCandidateModal = false;
  @tracked shouldDisplayEditCertificationCandidateModal = false;
  @tracked certificationCandidateInDetailsModal = null;
  @tracked certificationCandidateInEditModal = null;
  @tracked showNewCandidateModal = false;

  get shouldDisplayAccessibilityAdjustmentNeededFeature() {
    return (
      this.currentUser.currentAllowedCertificationCenterAccess.isV3Pilot &&
      this.featureToggles.featureToggles?.isNeedToAdjustCertificationAccessibilityEnabled
    );
  }

  @action
  formattedCandidateExtratimePercentage(value) {
    return value ? formatPercentage([value]) : '-';
  }

  @action
  async deleteCertificationCandidate(certificationCandidate) {
    this.notifications.clearAll();
    const sessionId = this.args.sessionId;

    try {
      await certificationCandidate.destroyRecord({ adapterOptions: { sessionId } });
      this.notifications.success(this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.success-remove`));
    } catch (error) {
      let errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.error-remove-unknown`);
      if (get(error, 'errors[0].code') === 403) {
        errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.error-remove-already-in`);
      }
      this.notifications.error(errorText);
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
      this.candidatesInStaging.removeObject(candidate);
      this.closeNewCandidateModal();
    }
    return success;
  }

  @action
  removeCertificationCandidateFromStaging(candidate) {
    this.candidatesInStaging.removeObject(candidate);
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
      this.notifications.success(this.intl.t('pages.sessions.detail.candidates.edit-modal.notifications.success'));
      this.closeEditCandidateModal();
    } catch (e) {
      this.notifications.error(this.intl.t('pages.sessions.detail.candidates.edit-modal.notifications.error'));
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
    this.notifications.clearAll();
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
      this.notifications.success(this.intl.t(`${TRANSLATE_PREFIX}.add-modal.notifications.success-add`));
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

  _handleMissingQueryParamError(errorResponse) {
    const error = errorResponse?.errors?.[0];
    if (error?.detail === 'CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID') {
      return this.intl.t(`common.api-error-messages.certification-candidate.${error.detail}`);
    }
  }

  _handleSavingError({ errorText, certificationCandidate }) {
    const error = errorText ?? this.intl.t(`common.api-error-messages.internal-server-error`);
    this.notifications.error(error);
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
    <div class='panel'>
      <div class='panel-header'>
        <h3 class='panel-header__title'>
          {{t 'pages.sessions.detail.candidates.list.title'}}
          ({{@certificationCandidates.length}})
        </h3>
        {{#if @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
          <PixButtonLink
            @route='authenticated.sessions.add-student'
            @model={{@sessionId}}
            class='enrolled-candidate__add-students'
          >
            {{t 'pages.sessions.detail.candidates.list.actions.inscription-multiple.label'}}
          </PixButtonLink>
        {{else}}
          <PixButton id='add-candidate' @triggerAction={{this.openNewCandidateModal}} @size='small'>
            {{t 'pages.sessions.detail.candidates.list.actions.inscription.label'}}
          </PixButton>
        {{/if}}
      </div>
      <div class='table content-text content-text--small certification-candidates-table'>
        {{#if (or @certificationCandidates this.candidatesInStaging)}}
          <table class='certification-candidates-table-cpf-toggle-enabled'>
            <caption class='screen-reader-only'>
              {{#if @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                {{t 'pages.sessions.detail.candidates.list.without-details-description'}}
              {{else}}
                {{t 'pages.sessions.detail.candidates.list.with-details-description'}}
              {{/if}}
            </caption>
            <thead>
              <tr>
                <th class='certification-candidates-table__column-last-name'>
                  {{t 'common.labels.candidate.birth-name'}}
                </th>
                <th class='certification-candidates-table__column-first-name'>
                  {{t 'common.labels.candidate.firstname'}}
                </th>
                <th class='certification-candidates-table__column-birthdate'>
                  {{t 'common.labels.candidate.birth-date'}}
                </th>
                {{#if @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                  <th class='certification-candidates-table__birth-city'>
                    {{t 'common.labels.candidate.birth-city'}}
                  </th>
                  <th>
                    {{t 'common.labels.candidate.birth-country'}}
                  </th>
                {{/if}}
                {{#unless @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                  <th class='certification-candidates-table__recipient-email'>
                    {{t 'common.forms.certification-labels.email-results'}}
                  </th>
                {{/unless}}
                {{#unless @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                  <th class='certification-candidates-table__external-id'>
                    {{t 'common.forms.certification-labels.external-id'}}
                  </th>
                {{/unless}}
                <th class='certification-candidates-table__column-time'>
                  {{t 'common.forms.certification-labels.extratime'}}
                </th>
                {{#if this.shouldDisplayAccessibilityAdjustmentNeededFeature}}
                  <th class='certification-candidates-table__column-accessibility'>
                    {{t 'common.forms.certification-labels.accessibility'}}
                  </th>
                {{/if}}
                {{#if @shouldDisplayPaymentOptions}}
                  <th class='certification-candidates-table__payment-options'>
                    {{t 'common.forms.certification-labels.pricing'}}
                  </th>
                {{/if}}
                <th>
                  <span class='certification-candidates-table__selected-subscriptions'>
                    {{t 'common.forms.certification-labels.selected-subscriptions'}}
                    {{#if this.showCompatibilityTooltip}}
                      <PixTooltip @id='tooltip-compatibility-subscription' @position='bottom' @isWide={{true}}>
                        <:triggerElement>
                          <FaIcon
                            @icon='circle-info'
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
                </th>
              </tr>
            </thead>
            <tbody>
              {{#each @certificationCandidates as |candidate|}}
                <tr>
                  <td>{{candidate.lastName}}</td>
                  <td>{{candidate.firstName}}</td>
                  <td>{{dayjsFormat candidate.birthdate 'DD/MM/YYYY'}}</td>
                  {{#if @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                    <td>{{candidate.birthCity}}</td>
                    <td>{{candidate.birthCountry}}</td>
                  {{/if}}
                  {{#unless @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                    <td>{{candidate.resultRecipientEmail}}</td>
                  {{/unless}}
                  {{#unless @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                    <td>{{candidate.externalId}}</td>
                  {{/unless}}
                  <td>{{this.formattedCandidateExtratimePercentage candidate.extraTimePercentage}}</td>
                  {{#if this.shouldDisplayAccessibilityAdjustmentNeededFeature}}
                    <td>{{candidate.accessibilityAdjustmentNeededLabel}}</td>
                  {{/if}}
                  {{#if @shouldDisplayPaymentOptions}}
                    <td>{{candidate.billingModeLabel}}
                      {{candidate.prepaymentCode}}
                    </td>
                  {{/if}}

                  <td>
                    {{this.computeSubscriptionsText candidate}}
                  </td>
                  <td>
                    <div class='certification-candidates-actions'>
                      {{#unless @shouldDisplayPrescriptionScoStudentRegistrationFeature}}
                        <div class='certification-candidates-actions__display-details'>
                          <button
                            type='button'
                            class='button--showed-as-link'
                            {{on 'click' (fn this.openCertificationCandidateDetailsModal candidate)}}
                            aria-label='{{t
                              "pages.sessions.detail.candidates.list.actions.details.extra-information"
                            }} {{candidate.firstName}} {{candidate.lastName}}'
                          >
                            {{t 'pages.sessions.detail.candidates.list.actions.details.label'}}
                          </button>
                        </div>
                      {{/unless}}
                      {{#if this.shouldDisplayAccessibilityAdjustmentNeededFeature}}
                        <div class='certification-candidates-actions__edit'>
                          {{#if candidate.isLinked}}
                            <PixTooltip @position='left' @isInline={{true}} @id='tooltip-edit-student-button'>
                              <:triggerElement>
                                <PixIconButton
                                  @icon='pen-to-square'
                                  class='certification-candidates-actions__edit-button--disabled'
                                  aria-label='{{t
                                    "pages.sessions.detail.candidates.list.actions.edit.extra-information"
                                  }} {{candidate.firstName}} {{candidate.lastName}}'
                                  aria-disabled='true'
                                  aria-describedby='tooltip-edit-student-button'
                                  @withBackground={{true}}
                                />
                              </:triggerElement>
                              <:tooltip>{{t 'pages.sessions.detail.candidates.list.actions.edit.tooltip'}}</:tooltip>
                            </PixTooltip>
                          {{else}}
                            <PixIconButton
                              @icon='pen-to-square'
                              {{on 'click' (fn this.openEditCertificationCandidateDetailsModal candidate)}}
                              aria-label='{{t
                                "pages.sessions.detail.candidates.list.actions.edit.extra-information"
                              }} {{candidate.firstName}} {{candidate.lastName}}'
                              class='certification-candidates-actions__edit-button'
                              @withBackground={{true}}
                            />
                          {{/if}}
                        </div>
                      {{/if}}
                      <div class='certification-candidates-actions__delete'>
                        {{#if candidate.isLinked}}
                          <PixTooltip @position='left' @isInline={{true}} @id='tooltip-delete-student-button'>
                            <:triggerElement>
                              <PixIconButton
                                @icon='trash-alt'
                                class='certification-candidates-actions__delete-button--disabled'
                                aria-label='{{t
                                  "pages.sessions.detail.candidates.list.actions.delete.extra-information"
                                }} {{candidate.firstName}} {{candidate.lastName}}'
                                aria-disabled='true'
                                aria-describedby='tooltip-delete-student-button'
                                @withBackground={{true}}
                              />
                            </:triggerElement>
                            <:tooltip>{{t 'pages.sessions.detail.candidates.list.actions.delete.tooltip'}}</:tooltip>
                          </PixTooltip>
                        {{else}}
                          <PixIconButton
                            @icon='trash-alt'
                            {{on 'click' (fn this.deleteCertificationCandidate candidate)}}
                            aria-label='{{t
                              "pages.sessions.detail.candidates.list.actions.delete.extra-information"
                            }} {{candidate.firstName}} {{candidate.lastName}}'
                            class='certification-candidates-actions__delete-button'
                            @withBackground={{true}}
                          />
                        {{/if}}
                      </div>
                    </div>
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        {{else}}
          <div class='table__empty content-text'>
            <p>{{t 'pages.sessions.detail.candidates.list.empty'}}</p>
          </div>
        {{/if}}
      </div>
    </div>

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
