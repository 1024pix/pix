import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Details from 'pix-orga/components/mission/details';
import Navigation from 'pix-orga/components/mission/navigation';
<template>
  {{pageTitle (t "pages.missions.mission.title")}}
  <article class="mission-page">
    <Details @mission={{@model.mission}} />
    <Navigation />
    {{outlet}}
  </article>
</template>
