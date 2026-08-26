import ExpandableAccordion from '../expandable-accordion';
import Competence from './competence';

<template>
  {{#each @areas as |area|}}
    <div class="area-border-container">
      <div class="area-border {{area.color}}"></div>
      <ExpandableAccordion class="{{area.color}} list-competences" @expansion={{@expansion}}>
        <:title>{{area.code}} · {{area.title}}</:title>
        <:content>
          {{#each area.sortedCompetences as |competence|}}
            <Competence
              @competence={{competence}}
              @expansion={{@expansion}}
              @setLevelTube={{@setLevelTube}}
              @selectedTubeIds={{@selectedTubeIds}}
              @checkTube={{@checkTube}}
              @uncheckTube={{@uncheckTube}}
              @tubeLevels={{@tubeLevels}}
              @displayDeviceCompatibility={{@displayDeviceCompatibility}}
              @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
              @displaySkillDifficultySelection={{@displaySkillDifficultySelection}}
            />
          {{/each}}
        </:content>
      </ExpandableAccordion>
    </div>
  {{/each}}
</template>
