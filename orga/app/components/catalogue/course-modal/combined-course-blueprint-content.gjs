import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

import CombinedCourseBlueprintItem from './combined-course-blueprint-item';

function getStepIndex(index) {
  return index + 1;
}

<template>
  <div class="combined-course-blueprint-detail">
    {{#each @combinedCourseBlueprint.steps as |step index|}}
      <div>
        <div class="combined-course-blueprint-step">
          <h4 class="pix-title-xs">
            {{t "pages.catalogue.modal.combined-course-content.step" number=(getStepIndex index)}}
          </h4>
          {{#if (eq step.type "module")}}
            <p class="pix-body-s combined-course-blueprint-step__description">
              {{t "pages.catalogue.modal.combined-course-content.module-info"}}
            </p>
          {{/if}}
        </div>
        <div class="combined-course-blueprint-detail__steps">

          {{#each step.items as |item|}}
            <CombinedCourseBlueprintItem @item={{item}} />
          {{/each}}
        </div>
      </div>
    {{/each}}
  </div>
</template>
