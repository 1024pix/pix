import PixBanner from '@1024pix/pix-ui/components/pix-banner';
import { t } from 'ember-intl';

<template>
  <PixBanner class="beta-banner" @type="communication">
    {{t "pages.modulix.beta-banner"}}
  </PixBanner>
</template>
