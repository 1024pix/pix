import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Header from 'pix-admin/components/complementary-certifications/item/header';
<template>
  {{pageTitle "Certification complémentaire " @model.id " | Pix Admin" replace=true}}

  <Header @complementaryCertificationLabel={{@model.label}} />

  <PixTabs
    class="complementary-certification__tabs"
    @ariaLabel={{t "components.complementary-certifications.item.navigation.aria-label"}}
  >
    {{#if @model.hasComplementaryReferential}}
      <LinkTo @route="authenticated.complementary-certifications.item.framework">
        {{t "components.complementary-certifications.item.framework.tab"}}
      </LinkTo>
    {{/if}}
    <LinkTo @route="authenticated.complementary-certifications.item.target-profile">
      {{t "components.complementary-certifications.item.target-profile"}}
    </LinkTo>
  </PixTabs>

  <main class="page-body complementary-certification">
    {{outlet}}
  </main>
</template>
