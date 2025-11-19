import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/organizations/breadcrumb';
import CreationForm from 'pix-admin/components/organizations/creation-form';
<template>
  {{pageTitle "Nouvelle orga"}}
  <header class="page-header">
    {{#if @controller.parentOrganizationName}}
      <Breadcrumb @currentPageLabel="Nouvelle organisation fille" />
    {{else}}
      <Breadcrumb @currentPageLabel="Nouvelle organisation" />
    {{/if}}
  </header>

  <main class="main-admin-form">
    <CreationForm
      @organization={{@model}}
      @onSubmit={{@controller.addOrganization}}
      @onCancel={{@controller.goBackToOrganizationList}}
      @parentOrganizationName={{@controller.parentOrganizationName}}
    />
  </main>
</template>
