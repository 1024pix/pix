import PixBlock from '@1024pix/pix-ui/components/pix-block';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CertificationBanners from 'mon-pix/components/certification-banners/index';
import CertificationJoiner from 'mon-pix/components/certification-joiner';
import CertificationNotCertifiable from 'mon-pix/components/certification-not-certifiable';

<template>
  {{pageTitle (t "pages.certification-start.title")}}

  <main id="main" class="global-page-container" role="main">
    {{#if @controller.model.isCertifiable}}
      <PixBlock class="certification-join-page__block">
        <CertificationBanners
          @certificationEligibility={{@controller.model}}
          @fullName={{@controller.currentUser.user.fullName}}
        />
        <CertificationJoiner @onStepChange={{@controller.changeStep}} />
      </PixBlock>
    {{else}}
      <CertificationNotCertifiable />
    {{/if}}
  </main>
</template>
