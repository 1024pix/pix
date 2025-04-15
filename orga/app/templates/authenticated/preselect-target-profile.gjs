import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import List from 'pix-orga/components/tube/list';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle (t "pages.preselect-target-profile.title")}}

  <article class="preselect-target-profile">
    <PageTitle>
      <:title>{{t "pages.preselect-target-profile.title"}}</:title>
    </PageTitle>
    <List @frameworks={{@controller.model.frameworks}} @organization={{@controller.model.organization}} />
  </article>
</template>
