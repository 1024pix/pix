import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';

<template>
  <section class="badge-form-criterion">
    <header>
      <h3>Critère d’obtention sur l’ensemble du profil cible</h3>
    </header>
    <PixInput
      @id="campaignThreshold"
      class="badge-form-criterion__threshold"
      type="number"
      min="0"
      max="100"
      @requiredLabel="Champ obligatoire"
      {{on "change" @onThresholdChange}}
    >
      <:label>Taux de réussite requis :</:label>
    </PixInput>
  </section>
</template>
