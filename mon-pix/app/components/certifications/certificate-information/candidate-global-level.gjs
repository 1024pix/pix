import { PixBlock, PixTag } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

import GlobalLevelGauge from './global-level-gauge';

<template>
  <div class="certification-score-information">
    <p>{{t "pages.certificate.certification-value.paragraphs.1"}}</p>
    <p>{{t "pages.certificate.certification-value.paragraphs.2"}}</p>
    <p class="certification-score-information--bold">{{t "pages.certificate.certification-value.paragraphs.3"}}</p>
  </div>

  <div class="hide-on-mobile">
    <GlobalLevelGauge @certificate={{@certificate}} />
  </div>

  {{#if @certificate.globalLevelLabel}}
    <PixBlock class="candidate-global-information">
      <div class="candidate-global-information__level">
        <img
          class="candidate-global-information-level__image"
          src="/images/certificate/global-level-image.svg"
          alt=""
          role="presentation"
        />
        <div class="candidate-global-information-level__container">
          <h2>{{t "pages.certificate.global.labels.level"}}</h2>
          <PixTag>{{@certificate.globalLevelLabel}}</PixTag>
        </div>
      </div>
      <div>
        <p class="candidate-global-information--bold">{{@certificate.globalSummaryLabel}}</p>
        <p>{{@certificate.globalDescriptionLabel}}</p>
      </div>
    </PixBlock>
  {{/if}}
</template>
