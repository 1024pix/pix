import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import dayjsUtcFormat from 'pix-certif/helpers/dayjs-utc-format';
import { formatPercentage } from 'pix-certif/helpers/format-percentage';

import CandidateDetailsModal from './candidate-details-modal';
import CandidateEditionModal from './candidate-edition-modal';

const TRANSLATE_PREFIX = 'pages.sessions.detail.candidates';

export default class EnrolledCandidates extends Component {
  @service store;
  @service intl;
  @service pixToast;
  @service featureToggles;
  @tracked shouldDisplayCertificationCandidateModal = false;
  @tracked shouldDisplayEditCertificationCandidateModal = false;
  @tracked certificationCandidateInDetailsModal = null;
  @tracked certificationCandidateInEditModal = null;

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
        message: this.intl.t(`${TRANSLATE_PREFIX}.add-form.notifications.success-remove`),
      });
    } catch (error) {
      let errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-form.notifications.error-remove-unknown`);
      if (get(error, 'errors[0].code') === 403) {
        errorText = this.intl.t(`${TRANSLATE_PREFIX}.add-form.notifications.error-remove-already-in`);
      }
      this.pixToast.sendErrorNotification({ message: errorText });
    }
  }

  @action
  updateEditCandidateInStagingFieldFromValue(candidateInStaging, field, event) {
    candidateInStaging.set(field, event.target.checked);
  }

  @action
  async updateCandidate() {
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
  closeEditCandidateModal() {
    this.shouldDisplayEditCertificationCandidateModal = false;
  }

  computeSubscriptionsText = (candidate) => {
    return this.intl.t(`${TRANSLATE_PREFIX}.list.subscriptions.${candidate.subscription}`);
  };

  @action
  isAccessibilityAdjustmentEnabled(hasCoreScopeSubscription) {
    if (hasCoreScopeSubscription) return true;
    return this.featureToggles.featureToggles?.isPixPlusCandidateA11yEnabled;
  }

  <template>
    <header class='panel-header'>
      <h3 class='panel-header__title'>
        {{t 'pages.sessions.detail.candidates.list.title'}}
        ({{@certificationCandidates.length}})
      </h3>
      {{#if @shouldDisplayScoStudentRegistration}}
        <PixButtonLink
          @route='authenticated.sessions.add-student'
          @model={{@sessionId}}
          @isDisabled={{@disableEnrollCandidate}}
        >
          {{t 'pages.sessions.detail.candidates.list.actions.inscription-multiple.label'}}
        </PixButtonLink>
      {{else}}
        <PixButtonLink
          @route='authenticated.sessions.add-candidate'
          @model={{@sessionId}}
          @isDisabled={{@disableEnrollCandidate}}
        >
          {{t 'pages.sessions.detail.candidates.list.actions.inscription.label'}}
        </PixButtonLink>
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
              {{dayjsUtcFormat candidate.birthdate 'DD/MM/YYYY'}}
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
          <PixTableColumn @context={{context}} class='table__column--small'>
            <:header>
              {{t 'common.forms.certification-labels.accessibility'}}
            </:header>
            <:cell>
              {{candidate.accessibilityAdjustmentNeededLabel}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class='table__column'>
            <:header>
              <span class='certification-candidates-table__selected-subscriptions'>
                {{t 'common.forms.certification-labels.selected-subscriptions'}}
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
                {{#if (this.isAccessibilityAdjustmentEnabled candidate.hasCoreScopeSubscription)}}
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
      />
    {{/if}}

    <CandidateEditionModal
      @showModal={{this.shouldDisplayEditCertificationCandidateModal}}
      @closeModal={{this.closeEditCandidateModal}}
      @candidate={{this.certificationCandidateInEditModal}}
      @updateCandidateDataFromValue={{this.updateEditCandidateInStagingFieldFromValue}}
      @updateCandidate={{this.updateCandidate}}
    />
  </template>
}
