import { PixBlock } from '@1024pix/nebulix-ember';

<template>
  <div class="grain-summary">
    <span class="grain-summary__decoration"></span>
    <PixBlock class="grain-summary__block">
      <img src="/images/modulix/megaphone.png" class="grain-summary__image" alt="" />

      {{yield}}
    </PixBlock>
  </div>
</template>
