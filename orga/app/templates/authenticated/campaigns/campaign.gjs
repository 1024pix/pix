import pageTitle from 'ember-page-title/helpers/page-title';
import ArchivedBanner from 'pix-orga/components/campaign/header/archived-banner';
import Tabs from 'pix-orga/components/campaign/header/tabs';
import Title from 'pix-orga/components/campaign/header/title';
<template>
  {{pageTitle @model.name}}

  <article class="campaign-page">
    <Title @campaign={{@model}} />

    <Tabs @campaign={{@model}} />

    <ArchivedBanner @campaign={{@model}} />

    {{outlet}}
  </article>
</template>
