import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

import CombinedCourseItem from './combined-course-item';

export default class CombinedCourseItemsList extends Component {
  step = 1;

  @action
  getCurrentStep() {
    return this.step++;
  }

  <template>
    <article class="combined-course__content">
      {{#each @combinedCourse.items as |item index|}}
        {{#unless @combinedCourse.areItemsOfTheSameType}}
          {{#if (@combinedCourse.isPreviousItemDifferent index)}}
            <h2 class="combined-course__step-title">{{t
                "pages.combined-courses.content.step"
                stepNumber=(this.getCurrentStep)
              }}</h2>
          {{/if}}
        {{/unless}}
        <CombinedCourseItem
          @item={{item}}
          @isLocked={{item.isLocked}}
          @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem item}}
          @onClick={{fn @startQuestParticipation}}
          @isCombinedCourseCompleted={{eq @combinedCourse.status "COMPLETED"}}
          @displayNextItemTag={{@displayNextItemTag}}
        />
      {{/each}}
    </article>
  </template>
}
