import PixBlock from '@1024pix/pix-ui/components/pix-block';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Steps from 'mon-pix/components/certification-instructions/steps';
<template>
  {{pageTitle (t "pages.certification-instructions.title")}}
  <main class="certification-instructions">
    <header class="instructions-header">
      <img class="instructions-header__logo" src="/images/pix-logo-blanc.svg" alt />
      <span class="instructions-header__separator"></span>
      <h1 class="instructions-header__title">{{t "pages.certification-instructions.title"}}</h1>
    </header>
    <PixBlock @shadow="heavy" class="instructions-step">
      <Steps @candidate={{@model.certificationCandidate}} @certificationInfo={{@model.certificationInfo}} />
    </PixBlock>
  </main>
</template>
