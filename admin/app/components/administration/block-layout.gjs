import PixBlock from '@1024pix/pix-ui/components/pix-block';

<template>
  <PixBlock class="page-section" @shadow="light">
    <header class="page-section__header">
      <h2 class="page-section__title">
        {{@title}}
      </h2>
    </header>

    {{#if @description}}
      <p class="description">{{@description}}</p>
    {{/if}}

    <div class="block-layout__actions {{@actionsClass}}">{{yield}}</div>
  </PixBlock>
</template>
