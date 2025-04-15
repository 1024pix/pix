import NotificationContainer from '@1024pix/ember-cli-notifications/components/notification-container';
import PixAppLayout from '@1024pix/pix-ui/components/pix-app-layout';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Communication from 'pix-orga/components/banner/communication';
import InformationBanners from 'pix-orga/components/banner/information-banners';
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
    </:banner>
    <:navigation>
      {{#if @controller.isAuthenticatedRoute}}
        <Sidebar
          @placesCount={{@model.placeStatistics.available}}
          @onChangeOrganization={{@controller.onChangeOrganization}}
        />
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
  <NotificationContainer @position="bottom-right" />
</template>
