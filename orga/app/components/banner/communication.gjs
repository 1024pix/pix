import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { htmlSafe } from '@ember/template';
import isEmpty from 'lodash/isEmpty';
import ENV from 'pix-orga/config/environment';

import textWithMultipleLang from '../../helpers/text-with-multiple-lang.js';

function isEnabled() {
  return !isEmpty(ENV.APP.BANNER_CONTENT) && !isEmpty(ENV.APP.BANNER_TYPE);
}

function bannerType() {
  return ENV.APP.BANNER_TYPE;
}

function bannerContent() {
  return htmlSafe(ENV.APP.BANNER_CONTENT);
}

<template>
  {{#if (isEnabled)}}
    <PixBanner @type={{(bannerType)}} class="sticker-banner">
      {{textWithMultipleLang (bannerContent)}}
    </PixBanner>
  {{/if}}
</template>
