import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import UserCertifications from 'mon-pix/components/certifications/dashboard/user-certifications';

<template>
  {{pageTitle (t "pages.certification-start.title")}}
  <h1 class="sr-only">{{t "pages.certification-start.title"}}</h1>

  <UserCertifications @certificationsSummaries={{@model.certificationsSummaries}} />
</template>
