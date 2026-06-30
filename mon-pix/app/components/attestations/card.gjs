import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import dayjs from 'dayjs';
import { t } from 'ember-intl';

function attestationDelivery(obtainedAt) {
  return dayjs(obtainedAt).format('D MMM YYYY');
}

<template>
  <PixBlock class="attestation-card">
    <header class="attestation-card__header">
      <div class="attestation-card__content">
        <h2 class="attestation-card__title">{{@attestationDetail.label}}</h2>
        <p class="attestation-card__subtitle">{{t
            "components.attestations.obtainedAt"
            date=(attestationDelivery @attestationDetail.obtainedAt)
          }}</p>
      </div>
      <img
        src="/images/illustrations/attestations/{{@attestationDetail.key}}.svg"
        alt=""
        class="attestation-card__illustration"
      />
    </header>

    <PixButton
      @triggerAction={{fn @downloadAttestation @attestationDetail}}
      @variant="secondary"
      @iconBefore="download"
      class="attestation-card__button"
    >
      {{t "pages.certificate.actions.download-attestation"}}
    </PixButton>
  </PixBlock>
</template>
