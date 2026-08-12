import PixBlock from '@1024pix/pix-ui/components/pix-block';

import ExpandableAccordions from '../common/expandable-accordions';
import Area from '../common/tubes-details/area';

<template>
  <PixBlock @variant="admin">
    {{#if @areas.length}}
      <ExpandableAccordions>
        {{#each @areas as |area|}}
          <Area
            @title={{area.title}}
            @color={{area.color}}
            @competences={{area.competences}}
            @displayDeviceCompatibility={{true}}
            @displaySkillDifficultyAvailability={{true}}
          />
        {{/each}}
      </ExpandableAccordions>
    {{else}}
      <section class="page-section">
        <div class="table__empty">Profil cible vide.</div>
      </section>
    {{/if}}
  </PixBlock>
</template>
