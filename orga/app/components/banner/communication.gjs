import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';
import { htmlSafe } from '@ember/template';
import ENV from 'pix-orga/config/environment';

import textWithMultipleLang from '../../helpers/text-with-multiple-lang';

function isEnabled() {
  return ENV.APP.BANNER_CONTENT?.trim() !== '' && ENV.APP.BANNER_TYPE?.trim() !== 0;
}

function bannerType() {
  return ENV.APP.BANNER_TYPE;
}

function bannerContent() {
  return htmlSafe(ENV.APP.BANNER_CONTENT);
}

<template>
  {{#if (isEnabled)}}
    <PixBannerAlert @type={{(bannerType)}}>
      {{textWithMultipleLang (bannerContent)}}
    </PixBannerAlert>
  {{/if}}
</template>
