import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';

<template>
  {{#if (gt @occupied @total)}}
    <PixBanner class="capacity-alert" @type="error" @withIcon="true">
      {{t "banners.over-capacity.message"}}
    </PixBanner>
  {{/if}}
</template>
