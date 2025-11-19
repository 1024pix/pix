import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/campaigns/breadcrumb';
import Details from 'pix-admin/components/campaigns/details';
import Update from 'pix-admin/components/campaigns/update';
<template>
  {{pageTitle "Campagne " @model.name}}

  <header class="page-header">
    <Breadcrumb @campaign={{@model}} />
  </header>

  <main class="page-body">
    {{#if @controller.isEditMode}}
      <Update @campaign={{@model}} @onExit={{@controller.toggleEditMode}} />
    {{else}}
      <Details @campaign={{@model}} @toggleEditMode={{@controller.toggleEditMode}} />
    {{/if}}

    {{outlet}}
  </main>
</template>
