import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <PixNotificationAlert @type="info" @withIcon="true" class="module-is-beta-banner" role="alert">
    {{t "pages.modulix.beta-banner"}}
  </PixNotificationAlert>
</template>
