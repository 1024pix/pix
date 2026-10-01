import { PixIcon } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <dl>
    <dt>
      <PixIcon @name="acute" class="duration__icon" @ariaHidden={{true}} />
    </dt>
    <dd>
      <span aria-label={{t "pages.combined-courses.items.aria-label-duration" duration=@duration}}>
        {{t "pages.combined-courses.items.duration" duration=@duration}}
      </span>
    </dd>
  </dl>
</template>
