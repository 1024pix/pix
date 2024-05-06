import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import * as dayjs from 'dayjs'

function displayBanner(importDetail) {
  if (!importDetail) {
    return false;
  }
  return dayjs().diff(importDetail.updatedAt, 'day') < 15;
}

function bannerType(importDetail) {
  if (importDetail?.hasError) {
    return 'error';
  } else if (importDetail?.isDone) {
    return 'success';
  }
  return 'information';
}

function message(importDetail) {
  if (importDetail?.hasError) {
    return 'components.import-information-banner.error';
  } else if (importDetail?.isDone) {
    return 'components.import-information-banner.success';
  }
  if (importDetail?.inProgress) {
    return 'components.import-information-banner.in-progress';
  }
  return null;
}

function linkMessage(importDetail) {
  if (importDetail?.inProgress) {
    return 'components.import-information-banner.in-progress-link';
  }
  if (importDetail?.hasError) {
    return 'components.import-information-banner.error-link';
  }
  return null;
}

<template>
  {{#if (displayBanner @importDetail)}}
    <PixMessage class="import-information-banner" @type={{(bannerType @importDetail)}} @withIcon="true">
      <strong>{{t (message @importDetail)}}</strong>
      {{#if (linkMessage @importDetail)}}
        <LinkTo @route="authenticated.import-organization-participants" class="import-information-banner__link link">
          {{t (linkMessage @importDetail)}}
        </LinkTo>
      {{/if}}
    </PixMessage>
  {{/if}}
</template>
