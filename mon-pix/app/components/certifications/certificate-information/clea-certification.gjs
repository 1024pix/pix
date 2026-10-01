import { PixBlock } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <section>
    <h2 class="v3-candidate-certificate-complementary__title">{{t "pages.certificate.complementary.title"}}</h2>
    <p class="v3-candidate-certificate-complementary__description">{{t "pages.certificate.complementary.clea"}}</p>
    <PixBlock class="v3-candidate-certificate-complementary__information">
      <div class="v3-complementary-certification-details-image">
        <img
          src={{@certificate.acquiredComplementaryCertification}}
          alt="{{t 'pages.certificate.complementary.alternative'}}"
        />
      </div>
    </PixBlock>
  </section>
</template>
