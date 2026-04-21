import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import SearchForm from 'pix-admin/components/certifications/search-form';
<template>
  {{pageTitle @controller.pageTitle replace=true}}

  <header class="header">
    <h1>{{t "pages.certifications.certification.title"}} {{@model.id}}</h1>
    <SearchForm />
  </header>

  <PixTabs @variant="primary" @ariaLabel="Navigation de la section détails d'une certification" class="navigation">
    <LinkTo @route="authenticated.sessions.certification.informations" @model={{@model.id}}>
      Informations
    </LinkTo>
    {{#unless @model.isV3}}
      <LinkTo @route="authenticated.sessions.certification.neutralization">
        Neutralisation
      </LinkTo>
    {{/unless}}
    <LinkTo @route="authenticated.sessions.certification.details" @model={{@model.id}}>
      {{t "pages.certifications.certification.details.title"}}
    </LinkTo>
    {{#unless @model.isV3}}
      <LinkTo @route="authenticated.sessions.certification.profile" @model={{@model.id}}>
        Profil
      </LinkTo>
    {{/unless}}
  </PixTabs>

  {{outlet}}
</template>
