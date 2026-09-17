import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { t } from 'ember-intl';

<template>
  <dl>
    <dt>
      <PixIcon @name="barsUp" class="level__icon" @ariaHidden={{true}} />
    </dt>
    <dd>
      <span aria-label={{t "pages.combined-courses.items.aria-label-level" level=@level}}>
        {{@level}}
      </span>
    </dd>
  </dl>
</template>
