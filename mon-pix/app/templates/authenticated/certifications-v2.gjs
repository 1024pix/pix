import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CertificationEligibility from 'mon-pix/components/certifications/dashboard/eligibility';

<template>
  {{pageTitle (t "pages.certification-start.title")}}
  <h1>{{t "pages.certification-start.title"}}</h1>

  <CertificationEligibility @userEligibility={{@model.userEligibility}} />
</template>
