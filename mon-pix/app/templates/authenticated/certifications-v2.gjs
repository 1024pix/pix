import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import EnrolmentBanner from 'mon-pix/components/certifications/dashboard/enrolment-banner';
import UserCertifications from 'mon-pix/components/certifications/dashboard/user-certifications';

<template>
  {{pageTitle (t "pages.certification-start.title")}}
  <h1 class="sr-only">{{t "pages.certification-start.title"}}</h1>
  <EnrolmentBanner @userEligibility={{@model.userEligibility}} />

  <UserCertifications @certificationsSummaries={{@model.certificationsSummaries}} />
</template>
