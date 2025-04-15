import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import UpdateForm from 'pix-orga/components/campaign/update-form';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle @controller.campaignName}}
  {{pageTitle (t "pages.campaign-modification.title")}}

  <div>
    <PageTitle>
      <:title>{{t "pages.campaign-modification.title"}}</:title>
      <:subtitle>
        <h2 class="page-sub-title">{{@controller.campaignName}}</h2>
      </:subtitle>
    </PageTitle>

    <UpdateForm
      @campaign={{@model.campaign}}
      @onSubmit={{@controller.update}}
      @onCancel={{@controller.cancel}}
      @membersSortedByFullName={{@model.membersSortedByFullName}}
    />
  </div>
</template>
