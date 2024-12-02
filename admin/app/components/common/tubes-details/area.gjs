import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';

import Competence from '../tubes-details/competence';

<template>
  <div class="area-border-container">
    <div class="area-border {{@color}}"></div>
    <PixAccordions class="{{@color}} list-competences">
      <:title>{{@title}}</:title>
      <:content>
        {{#each @competences as |competence|}}
          <Competence
            @title={{competence.title}}
            @thematics={{competence.thematics}}
            @displayDeviceCompatibility={{@displayDeviceCompatibility}}
            @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
          />
        {{/each}}
      </:content>
    </PixAccordions>
  </div>
</template>
