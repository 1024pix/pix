<template>
  <ol class="module-objectives">
    {{#each @objectives as |objective|}}
      <li class="module-objectives__item">{{objective}}</li>
    {{/each}}
  </ol>
</template>
