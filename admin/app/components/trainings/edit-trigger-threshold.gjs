import PixInput from '@1024pix/pix-ui/components/pix-input';

import Card from '../card';
import TubesSelection from '../common/tubes-selection';

<template>
  <Card class="edit-training-trigger__threshold" @title={{@title}}>
    <p class="edit-training-trigger-threshold__description">{{@description}}</p>
    <PixInput
      class="edit-training-trigger-threshold__input"
      name="threshold"
      type="number"
      @id="thresholdInput"
      placeholder="Exemple&nbsp;:&nbsp;16"
      min="0"
      max="100"
    >
      <:label>Seuil en %&nbsp;:</:label>
    </PixInput>
  </Card>

  <TubesSelection @frameworks={{@frameworks}} @onChange={{@onChange}} />
</template>
