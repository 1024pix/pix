import pageTitle from 'ember-page-title/helpers/page-title';
import eq from 'ember-truth-helpers/helpers/eq';
import DetailsV2 from 'pix-admin/components/certifications/certification/details-v2';
import DetailsV3 from 'pix-admin/components/certifications/certification/details-v3';
<template>
  {{pageTitle @controller.pageTitle replace=true}}
  {{#if (eq @model.version 3)}}
    <DetailsV3 @details={{@model}} />
  {{else}}
    <DetailsV2 @details={{@model}} />
  {{/if}}
</template>
