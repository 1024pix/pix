import { PixButton } from '@1024pix/nebulix-ember';

import Card from '../card';

<template>
  <Card class="admin-form__card" @title="Évaluation terminée">
    <p>🎉 Évaluation terminée 🎉</p>
    <PixButton @variant="primary" @triggerAction={{@reset}}>
      Recommencer ?
    </PixButton>
  </Card>
</template>
