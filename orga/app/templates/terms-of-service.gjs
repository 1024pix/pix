import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Acceptance from 'pix-orga/components/terms-of-service/acceptance';
<template>
  {{pageTitle (t "pages.terms-of-service.title")}}

  <main class="terms-of-service-page">
    <Acceptance
      @legalDocumentStatus={{@model.legalDocumentStatus}}
      @legalDocumentPath={{@model.legalDocumentPath}}
      @onSubmit={{@controller.submit}}
    />
  </main>
</template>
