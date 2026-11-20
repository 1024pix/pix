import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import ListTable from 'pix-admin/components/organization-learners/list-table';
<template>
  {{pageTitle (t "pages.organization-learners-list.page-title")}}

  <h1>{{t "pages.organization-learners-list.main-title"}}</h1>

  <ListTable @organizationLearners={{@model}} />
</template>
