import ExpandableAccordion from '../expandable-accordion';
import Competence from '../tubes-details/competence';

<template>
  <div class="area-border-container">
    <div class="area-border {{@color}}"></div>
    <ExpandableAccordion class="{{@color}} list-competences" @expansion={{@expansion}}>
      <:title>{{@title}}</:title>
      <:content>
        {{#each @competences as |competence|}}
          <Competence
            @title={{competence.title}}
            @thematics={{competence.thematics}}
            @expansion={{@expansion}}
            @displayDeviceCompatibility={{@displayDeviceCompatibility}}
            @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
          />
        {{/each}}
      </:content>
    </ExpandableAccordion>
  </div>
</template>
