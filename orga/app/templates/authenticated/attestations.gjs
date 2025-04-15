import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Attestations from 'pix-orga/components/attestations';
<template>
  {{pageTitle (t "pages.attestations.title")}}

  <div class="attestations-page">
    <Attestations @divisions={{@model.options}} @onSubmit={{@controller.downloadAttestations}} />
  </div>
</template>
