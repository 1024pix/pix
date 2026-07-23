import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CreateForm from 'pix-orga/components/campaign/create-form-catalogue';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle (t "pages.campaign-creation.title")}}

  <PageTitle>
    <:title>{{t "pages.campaign-creation.title"}}</:title>
  </PageTitle>

  <CreateForm
    @campaign={{@model.campaign}}
    @errors={{@controller.errors}}
    @onSubmit={{@controller.createCampaign}}
    @onCancel={{@controller.cancel}}
    @membersSortedByFullName={{@model.membersSortedByFullName}}
    @hasBlueprints={{@model.hasBlueprints}}
  />
</template>
