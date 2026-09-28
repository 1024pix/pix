import { PixButton } from '@1024pix/nebulix-ember';
<template>
  <section class="start">
    <PixButton @variant="primary" @triggerAction={{@startAssessment}}>
      Démarrer la simulation
    </PixButton>
  </section>
</template>
