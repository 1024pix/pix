import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import View from 'pix-orga/components/campaign/settings/view';
<template>
  {{pageTitle (t "pages.campaign-settings.title")}}

  <View @campaign={{@model}} />
</template>
