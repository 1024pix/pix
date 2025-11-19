import pageTitle from 'ember-page-title/helpers/page-title';
import Header from 'pix-admin/components/sessions/certifications/header';
import List from 'pix-admin/components/sessions/certifications/list';
<template>
  {{! template-lint-disable no-action }}
  {{pageTitle "Session " @model.id " Certifications | Pix Admin" replace=true}}
  <section class="certification-list-page">

    <Header
      @session={{@controller.model.session}}
      @juryCertificationSummaries={{@controller.model.juryCertificationSummaries}}
      @unpublishSession={{@controller.unpublishSession}}
      @publishSession={{@controller.publishSession}}
    />

    <List
      @juryCertificationSummaries={{@controller.model.juryCertificationSummaries}}
      @pagination={{@controller.model.juryCertificationSummaries.meta}}
    />
  </section>
</template>
