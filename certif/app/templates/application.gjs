import { PixToastContainer } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CommunicationBanner from 'pix-certif/components/communication-banner';
import InformationBanners from 'pix-certif/components/information-banners';

<template>
  {{pageTitle @controller.model.title}}
  {{#in-element @controller.model.headElement insertBefore=null}}
    {{! template-lint-disable no-forbidden-elements }}
    <meta name='description' content={{t 'application.description'}} />
  {{/in-element}}

  <CommunicationBanner />

  <InformationBanners @banners={{@controller.model.informationBanner.banners}} />

  {{outlet}}

  <PixToastContainer @closeButtonAriaLabel={{t 'common.notifications.close-button.extra-information'}} />
</template>
