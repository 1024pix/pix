import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';

import FocusIcon from './mode/focus-icon';

<template>
  <PixNotificationAlert @type="warning" class="challenge__info-alert">
    <FocusIcon />
    <span>
      {{t "pages.challenge.is-focused-challenge.info-alert"}}
    </span>
  </PixNotificationAlert>
</template>
