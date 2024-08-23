import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

<template>
  <ol class="module-objectives">
    {{#each @objectives as |objective|}}
      <li class="module-objectives__item">{{htmlUnsafe objective}}</li>
    {{/each}}
  </ol>
</template>
