import PixCollapsible from '@1024pix/pix-ui/components/pix-collapsible';

import Competence from '../tubes-details/competence';

<template>
  <div class="area-border-container">
    <div class="area-border {{@color}}"></div>
    <PixCollapsible @title="{{@title}}" class="{{@color}} list-competences">
      {{#each @competences as |competence|}}
        <Competence
          @title={{competence.title}}
          @thematics={{competence.thematics}}
          @displayDeviceCompatibility={{@displayDeviceCompatibility}}
          @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
        />
      {{/each}}
    </PixCollapsible>
  </div>
</template>
