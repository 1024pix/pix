import { t } from 'ember-intl';

<template>
  <div data-testid="pw-candidate-certificate-pix-score" class="pix-score-hexagon">
    <span class="pix-score-hexagon__pix">{{t "common.pix"}}</span>
    <span class="pix-score-hexagon__score">{{@pixScore}}</span>
    <span class="pix-score-hexagon__certified">
      {{t "pages.certificate.hexagon-score.certified"}}
    </span>
  </div>
</template>
