import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Acceptation from 'pix-certif/components/terms-of-service/acceptation';
import TermsOfService from 'pix-certif/components/terms-of-service/index';

<template>
  {{pageTitle (t 'pages.terms-of-service.title')}}

  {{! TODO: supprimer la branche else avec le feature toggle newPixCertifLegalDocumentsVersioning }}
  {{#if @model.legalDocumentPath}}
    <main class='terms-of-service-acceptation-page'>
      <Acceptation
        @legalDocumentStatus={{@model.legalDocumentStatus}}
        @legalDocumentPath={{@model.legalDocumentPath}}
        @onSubmit={{@controller.submit}}
      />
    </main>
  {{else}}
    <TermsOfService @isEnglishLocale={{@controller.isEnglishLocale}} @onSubmit={{@controller.submit}} />
  {{/if}}
</template>
