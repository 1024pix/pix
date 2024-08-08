import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import { t } from 'ember-intl';
import { formatPercentage } from 'pix-certif/helpers/format-percentage';

import Row from './row';

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
    transform: (value) => (value ? dayjs(value).format('DD/MM/YYYY') : undefined),
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

export default class CertificationCandidateDetailsModal extends Component {
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
    <PixModal
      @title={{t 'pages.sessions.detail.candidates.detail-modal.title'}}
      @onCloseButtonClick={{@closeModal}}
      class='certification-candidate-details-modal'
      @showModal={{@showModal}}
    >
      <:content>
        <ul class='certification-candidate-details-modal__list'>
          {{#each FIELDS as |field|}}
            <Row @label={{this.getRowLabel field.label}} @value={{this.getRowValue field.value field.transform}} />
          {{/each}}
          {{#if @shouldDisplayPaymentOptions}}
            <Row
              @label={{this.getRowLabel 'forms.certification-labels.pricing'}}
              @value={{this.getRowValue 'billingModeLabel'}}
            />
            <Row
              @label={{this.getRowLabel 'forms.certification-labels.prepayment-code'}}
              @value={{this.getRowValue 'prepaymentCode'}}
            />
          {{/if}}
          <Row
            @label={{t 'common.forms.certification-labels.selected-subscriptions'}}
            @value={{this.computeSubscriptionsText @candidate}}
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
