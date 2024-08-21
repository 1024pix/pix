import { LinkTo } from '@ember/routing';
<template>
  <header class="page-header">
    <div class="page-title">
      <LinkTo @route="authenticated.complementary-certifications.list">Toutes les certifications complémentaires</LinkTo>
      <span class="wire">&nbsp;>&nbsp;</span>
      <h1>{{@complementaryCertificationLabel}}</h1>
    </div>
  </header>
</template>
