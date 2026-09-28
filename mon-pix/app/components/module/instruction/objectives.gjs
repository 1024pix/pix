import { PixIcon } from '@1024pix/nebulix-ember';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

<template>
  <ol class="module-objectives">
    {{#each @objectives as |objective|}}
      <li class="module-objectives__item">
        <PixIcon @name="checkCircle" @plainIcon={{true}} class="module-objectives-item__icon" @ariaHidden={{true}} />
        {{htmlUnsafe objective}}
      </li>
    {{/each}}
  </ol>
</template>
