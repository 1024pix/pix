import { PixBannerAlert } from '@1024pix/nebulix-ember';

import textWithMultipleLang from '../../helpers/text-with-multiple-lang.js';

<template>
  {{#each @banners as |banner|}}
    <PixBannerAlert @type={{banner.severity}}>
      {{textWithMultipleLang banner.message}}
    </PixBannerAlert>
  {{/each}}
</template>
