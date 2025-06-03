import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AssociateScoStudentWithMediacentreForm from 'mon-pix/components/routes/campaigns/join/associate-sco-student-with-mediacentre-form';
<template>
  {{pageTitle (t "pages.join.title")}}

  <div class="background-banner-wrapper">
    <div class="background-banner"></div>
    <main
      class="rounded-panel rounded-panel--strong rounded-panel--over-background-banner join-restricted-campaign__container"
      role="main"
    >
      <div class="join-restricted-campaign">
        <AssociateScoStudentWithMediacentreForm
          @organizationName={{@model.organizationName}}
          @organizationId={{@model.organizationId}}
          @campaignCode={{@model.code}}
          @onSubmit={{@controller.createAndReconcile}}
        />
      </div>
    </main>
  </div>
</template>
