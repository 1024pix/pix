import { PixBlock } from '@1024pix/nebulix-ember';

<template>
  <PixBlock class="action-cards-list-item" @variant="orga">
    <div>
      <h2>{{@title}}</h2>
      <p>{{@description}}</p>
    </div>
    {{yield}}
  </PixBlock>
</template>
