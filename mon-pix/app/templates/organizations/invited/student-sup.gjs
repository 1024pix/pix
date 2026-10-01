import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AssociateSupStudentForm from 'mon-pix/components/routes/organizations/invited/associate-sup-student-form';
<template>
  {{pageTitle (t "pages.join.title")}}

  <div class="background-banner-wrapper">
    <div class="background-banner"></div>
    <main
      class="rounded-panel rounded-panel--strong rounded-panel--over-background-banner join-restricted-campaign__container"
      role="main"
    >
      <div class="join-restricted-campaign">
        <AssociateSupStudentForm
          @organizationName={{@model.organizationToJoin.name}}
          @campaignCode={{@model.verifiedCode.id}}
          @organizationId={{@model.organizationToJoin.id}}
        />
      </div>
    </main>
  </div>
</template>
