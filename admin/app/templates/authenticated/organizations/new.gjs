import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/organizations/breadcrumb';
import CreationForm from 'pix-admin/components/organizations/creation-form';

<template>
  {{pageTitle "Nouvelle orga"}}
  <header class="header page-header">
    {{#if @model.parentOrganization}}
      <Breadcrumb @currentPageLabel={{t "pages.organizations.breadcrumb.new-child-organization-page"}} />
    {{else}}
      <Breadcrumb @currentPageLabel={{t "pages.organizations.breadcrumb.new-organization-page"}} />
    {{/if}}
  </header>

  <main class="main-admin-form">
    <CreationForm
      @administrationTeams={{@model.administrationTeams}}
      @countries={{@model.countries}}
      @organizationLearnerTypes={{@model.organizationLearnerTypes}}
      @onSubmit={{@controller.addOrganization}}
      @onCancel={{@controller.redirectOnCancel}}
      @parentOrganization={{@model.parentOrganization}}
    />
  </main>
</template>
