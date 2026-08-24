import { PixAppLayout, PixToastContainer } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import pageTitle from 'ember-page-title/helpers/page-title';
import Communication from 'pix-orga/components/banner/communication';
import InformationBanners from 'pix-orga/components/banner/information-banners';
import MaximumPlacesExceeded from 'pix-orga/components/banner/maximum-places-exceeded';
import Footer from 'pix-orga/components/layout/footer';
import Sidebar from 'pix-orga/components/layout/sidebar';

<template>
  {{pageTitle @model.title}}
  {{#in-element @model.headElement insertBefore=null}}
    {{! template-lint-disable no-forbidden-elements }}
    <meta name="description" content={{t "application.description"}} />
  {{/in-element}}

  <PixAppLayout @variant="orga" class="{{unless @controller.isAuthenticatedRoute 'unauthenticated-page'}}">
    <:banner>
      <Communication />
      <InformationBanners @banners={{@model.informationBanner.banners}} />
      <MaximumPlacesExceeded />
    </:banner>
    <:navigation>
      {{#if @controller.isAuthenticatedRoute}}
        <Sidebar />
      {{/if}}
    </:navigation>
    <:main>
      {{outlet}}
    </:main>
    <:footer>
      {{#if @controller.isAuthenticatedRoute}}
        <Footer />
      {{/if}}
    </:footer>
  </PixAppLayout>
  <PixToastContainer @closeButtonAriaLabel={{t "common.notification.close"}} />
</template>
