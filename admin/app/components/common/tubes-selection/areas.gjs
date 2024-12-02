import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';

import Competence from './competence';

<template>
  {{#each @areas as |area|}}
    <div class="area-border-container">
      <div class="area-border {{area.color}}"></div>
      <PixAccordions class="{{area.color}} list-competences">
        <:title>{{area.code}} · {{area.title}}</:title>
        <:content>
          {{#each area.sortedCompetences as |competence|}}
            <Competence
              @competence={{competence}}
              @setLevelTube={{@setLevelTube}}
              @selectedTubeIds={{@selectedTubeIds}}
              @checkTube={{@checkTube}}
              @uncheckTube={{@uncheckTube}}
              @tubeLevels={{@tubeLevels}}
              @displayDeviceCompatibility={{@displayDeviceCompatibility}}
              @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
            />
          {{/each}}
        </:content>
      </PixAccordions>
    </div>
  {{/each}}
</template>
