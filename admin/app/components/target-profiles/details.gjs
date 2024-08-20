import Area from '../common/tubes-details/area';

<template>
  {{#each @areas as |area|}}
    <Area
      @title={{area.title}}
      @color={{area.color}}
      @competences={{area.competences}}
      @displayDeviceCompatibility={{true}}
      @displaySkillDifficultyAvailability={{true}}
    />
  {{else}}
    <section class="page-section">
      <div class="table__empty">Profil cible vide.</div>
    </section>
  {{/each}}
</template>
