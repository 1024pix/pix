import ExpandableAccordion from '../../common/expandable-accordion';
import Competence from './competence';

<template>
  <div class="area-border-container">
    <div class="area-border {{@color}}"></div>
    <ExpandableAccordion class="{{@color}} list-competences" @expansion={{@expansion}}>
      <:title>{{@title}}</:title>
      <:content>
        {{#each @competences as |competence|}}
          <Competence @title={{competence.name}} @thematics={{competence.thematics}} @expansion={{@expansion}} />
        {{/each}}
      </:content>
    </ExpandableAccordion>
  </div>
</template>
