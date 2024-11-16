import PixCollapsible from '@1024pix/pix-ui/components/pix-collapsible';

import Competence from '../tubes-details/competence';

<template>
  <div class="area-border-container">
    <div class="area-border {{@color}}"></div>
    <PixCollapsible class="{{@color}} list-competences">
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
    </PixCollapsible>
  </div>
</template>
