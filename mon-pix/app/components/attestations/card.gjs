import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import dayjs from 'dayjs';
import { t } from 'ember-intl';

const ATTESTATION_TYPES = {
  PARENTHOOD: 'PARENTHOOD',
  SIXTH_GRADE: 'SIXTH_GRADE',
};

function attestationTitle(type) {
  if ([ATTESTATION_TYPES.PARENTHOOD, ATTESTATION_TYPES.SIXTH_GRADE].includes(type))
    return 'components.attestations.title.numeric-sensivity';
}

function attestationDelivery(obtainedAt) {
  return dayjs(obtainedAt).format('D MMM YYYY');
}

function getAttesttationIcon(type) {
  switch (type) {
    case ATTESTATION_TYPES.PARENTHOOD:
      return 'digital-awerness-parenthood.svg';
    case ATTESTATION_TYPES.SIXTH_GRADE:
      return 'digital-awerness-sixth-grade.svg';
    default:
      return null;
  }
}

<template>
  <PixBlock class="attestation-card">
    <header class="attestation-card__header">
      <div>
        <h2 class="attestation-card__title">{{t (attestationTitle @type)}}</h2>
        <p class="attestation-card__subtitle">{{t
            "components.attestations.obtainedAt"
            date=(attestationDelivery @obtainedAt)
          }}</p>
      </div>
      <img src="/images/illustrations/attestations/{{getAttesttationIcon @type}}" alt="" />
    </header>

    <PixButton
      @triggerAction={{fn @downloadAttestation @type}}
      @variant="secondary"
      @iconBefore="download"
      class="attestation-card__button"
    >
      {{t "pages.certificate.actions.download"}}
    </PixButton>
  </PixBlock>
</template>
