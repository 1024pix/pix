import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';

<template>
  {{#if (gt @occupied @total)}}
    <PixNotificationAlert @type="error" @withIcon={{true}}>
      {{t "banners.over-capacity.message"}}
    </PixNotificationAlert>
  {{/if}}
</template>
