import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Acceptation from 'pix-orga/components/terms-of-service/acceptation';
<template>
  {{pageTitle (t "pages.terms-of-service.title")}}

  <main class="terms-of-service-page">
    <Acceptation
      @legalDocumentStatus={{@model.legalDocumentStatus}}
      @legalDocumentPath={{@model.legalDocumentPath}}
      @onSubmit={{@controller.submit}}
    />
  </main>
</template>
