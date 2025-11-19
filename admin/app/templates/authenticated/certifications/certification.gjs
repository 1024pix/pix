import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
<template>
  {{pageTitle @controller.pageTitle replace=true}}
  <PixTabs @variant="primary" @ariaLabel="Navigation de la section détails d'une certification" class="navigation">
    <LinkTo @route="authenticated.certifications.certification.informations" @model={{@model.id}}>
      Informations
    </LinkTo>
    {{#unless @model.isV3}}
      <LinkTo @route="authenticated.certifications.certification.neutralization">
        Neutralisation
      </LinkTo>
    {{/unless}}
    <LinkTo @route="authenticated.certifications.certification.details" @model={{@model.id}}>
      {{t "pages.certifications.certification.details.title"}}
    </LinkTo>
    {{#unless @model.isV3}}
      <LinkTo @route="authenticated.certifications.certification.profile" @model={{@model.id}}>
        Profil
      </LinkTo>
    {{/unless}}
  </PixTabs>

  {{outlet}}
</template>
