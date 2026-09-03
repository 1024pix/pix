import PixBannerAlert from '@1024pix/pix-ui/components/pix-banner-alert';

import textWithMultipleLang from '../../helpers/text-with-multiple-lang';

<template>
  {{#each @banners as |banner|}}
    <PixBannerAlert @type={{banner.severity}}>
      {{textWithMultipleLang banner.message}}
    </PixBannerAlert>
  {{/each}}
</template>
