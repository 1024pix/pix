import { PixBlock } from '@1024pix/nebulix-ember';

<template>
  <div class="grain-summary">
    <div class="grain-summary__decoration"></div>
    <PixBlock class="grain-summary__block">
      {{yield}}
    </PixBlock>
  </div>
</template>
