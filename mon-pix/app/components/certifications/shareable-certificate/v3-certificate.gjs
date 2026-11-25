import { PixBlock, PixTag } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

import CleaCertification from '../certificate-information/clea-certification';
import CompetencesDetails from '../certificate-information/competences-details';
import GlobalLevelGauge from '../certificate-information/global-level-gauge';
import PixScoreHexagon from '../certificate-information/pix-score-hexagon';
import CertificateHero from './certificate-hero';
import ResultsInfos from './results-infos';
import PixPlusCertificate from './v3-pix-plus-certificate';

<template>
  <section class="v3-shareable-certificate">
    {{#if @certificate.hasPixPlusFramework}}
      <PixPlusCertificate @certificate={{@certificate}} />
    {{else}}
      <CertificateHero
        @certificate={{@certificate}}
        @subTitle={{t "pages.certificate.obtained-certification.shareable-core"}}
      >
        <:score>
          <PixScoreHexagon @pixScore={{@certificate.pixScore}} />
          {{#if @certificate.globalLevelLabel}}
            <PixTag @color="green">{{@certificate.globalLevelLabel}}</PixTag>
          {{/if}}
        </:score>
      </CertificateHero>

      <PixBlock class="v3-shareable-certificate__global-level">
        <h2 class="pix-title-xs">
          {{t "pages.certificate.global.progress-bar-explanation.shareable-progress-bar-title"}}
        </h2>
        <p class="pix-body-m">
          {{t "pages.certificate.global.progress-bar-explanation.shareable-progress-bar-description"}}
        </p>
        <GlobalLevelGauge @certificate={{@certificate}} />
      </PixBlock>

      {{#if @certificate.globalLevelLabel}}
        <ResultsInfos @summary={{@certificate.globalSummaryLabel}}>
          <:tag><PixTag>{{@certificate.globalLevelLabel}}</PixTag></:tag>
          <:description><p>{{@certificate.globalDescriptionLabel}}</p></:description>
        </ResultsInfos>
      {{/if}}

      <section class="v3-candidate-certificate__complementary">
        {{#if @certificate.resultCompetenceTree}}
          <CompetencesDetails @certificate={{@certificate}} @isShareableContext={{true}} />
        {{/if}}

        {{#if @certificate.acquiredComplementaryCertification}}
          <CleaCertification @certificate={{@certificate}} />
        {{/if}}
      </section>
    {{/if}}
  </section>
</template>
