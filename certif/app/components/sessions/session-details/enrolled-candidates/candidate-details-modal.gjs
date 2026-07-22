import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { formatPercentage } from 'pix-certif/helpers/format-percentage';

import { dayjsUtcFormat } from '../../../../helpers/dayjs-utc-format';
import CandidateDetailsModalRow from './candidate-details-modal-row';

const TRANSLATE_PREFIX = 'pages.sessions.detail.candidates';
const FIELDS = [
  {
    label: 'labels.candidate.birth-name',
    value: 'lastName',
  },
  {
    label: 'labels.candidate.firstname',
    value: 'firstName',
  },
  {
    label: 'labels.candidate.birth-date',
    value: 'birthdate',
    transform: (value) => (value ? dayjsUtcFormat([value, 'DD/MM/YYYY'], {}) : undefined),
  },
  {
    label: 'labels.candidate.gender.title',
    value: 'genderLabel',
  },
  {
    label: 'labels.candidate.birth-city',
    value: 'birthCity',
  },
  {
    label: 'labels.candidate.birth-city-postcode',
    value: 'birthPostalCode',
  },
  {
    label: 'labels.candidate.birth-city-insee-code',
    value: 'birthInseeCode',
  },
  {
    label: 'labels.candidate.birth-country',
    value: 'birthCountry',
  },
  {
    label: 'forms.certification-labels.email-results',
    value: 'resultRecipientEmail',
  },
  {
    label: 'forms.certification-labels.email-convocation',
    value: 'email',
  },
  {
    label: 'forms.certification-labels.external-id',
    value: 'externalId',
  },
  {
    label: 'forms.certification-labels.extratime-percentage',
    value: 'extraTimePercentage',
    transform: (value) => (value ? formatPercentage([value]) : undefined),
  },
];

export default class CandidateDetailsModal extends Component {
  @service intl;

  @action
  getRowLabel(label) {
    return this.intl.t(`common.${label}`);
  }

  @action
  getRowValue(key, transform = () => {}) {
    const value = this.args.candidate[key];

    return transform(value) || value || '-';
  }

  @action
  getAccessibilityAdjustmentNeeded() {
    return this.args.candidate['accessibilityAdjustmentNeeded']
      ? this.intl.t('common.labels.candidate.accessibility-adjusted-certification-needed')
      : '-';
  }

  @action
  getSubscriptionLabel() {
    return this.intl.t(`${TRANSLATE_PREFIX}.list.subscriptions.${this.args.candidate.subscription}`);
  }

  <template>
    <PixModal
      @title={{t 'pages.sessions.detail.candidates.detail-modal.title'}}
      @onCloseButtonClick={{@closeModal}}
      class='certification-candidate-details-modal'
      @showModal={{@showModal}}
    >
      <:content>
        <ul class='certification-candidate-details-modal__list'>
          {{#each FIELDS as |field|}}
            <CandidateDetailsModalRow
              @label={{this.getRowLabel field.label}}
              @value={{this.getRowValue field.value field.transform}}
            />
          {{/each}}
          <CandidateDetailsModalRow
            @label={{this.getRowLabel 'forms.certification-labels.accessibility'}}
            @value={{this.getAccessibilityAdjustmentNeeded}}
          />
          {{#if @shouldDisplayPaymentOptions}}
            <CandidateDetailsModalRow
              @label={{this.getRowLabel 'forms.certification-labels.pricing'}}
              @value={{this.getRowValue 'billingModeLabel'}}
            />
            <CandidateDetailsModalRow
              @label={{this.getRowLabel 'forms.certification-labels.prepayment-code'}}
              @value={{this.getRowValue 'prepaymentCode'}}
            />
          {{/if}}
          <CandidateDetailsModalRow
            @label={{t 'common.forms.certification-labels.selected-subscriptions'}}
            @value={{this.getSubscriptionLabel}}
          />
        </ul>
      </:content>

      <:footer>
        <PixButton
          @triggerAction={{@closeModal}}
          aria-label='{{t "pages.sessions.detail.candidates.detail-modal.actions.close-extra-information"}}'
        >{{t 'common.actions.close'}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
