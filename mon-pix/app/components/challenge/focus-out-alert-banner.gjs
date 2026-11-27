import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import FocusIcon from 'mon-pix/components/challenge/mode/focus-icon';

<template>
  <PixNotificationAlert @type="warning" class="focus-out-alert-banner">
    <FocusIcon />
    <span>
      {{t "components.challenge.focus-out-alert-banner.message"}}
    </span>
  </PixNotificationAlert>
</template>
