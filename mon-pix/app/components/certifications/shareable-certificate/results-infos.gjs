import { PixBlock } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <PixBlock class="results-infos">
    <img src="/images/illustrations/user-certifications/certificate-magnifier.png" alt="" />
    <div class="results-infos__details">
      <h3 class="results-infos__title">
        <span>{{t "pages.certificate.results.title"}}</span>
        {{yield to="tag"}}
      </h3>
      <p><strong>{{@summary}}</strong></p>
      {{yield to="description"}}
    </div>
  </PixBlock>
</template>
