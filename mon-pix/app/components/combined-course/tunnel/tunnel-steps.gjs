import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import CombinedCourseStepItem from 'mon-pix/components/combined-course/combined-course-step-item';

import StepDetails from './step-details';

const Step = <template>
  <h2 class="combined-course__step-title">
    {{t "pages.combined-courses.content.step" stepNumber=(@stepNumber)}}
  </h2>
</template>;

export default class TunnelSteps extends Component {
  @service currentUser;
  @service session;
  @service featureToggles;
  @service intl;
  @service store;
  @service router;

  @tracked selectedItem;

  step = 1;

  constructor() {
    super(...arguments);

    this.selectedItem = this.args.combinedCourse.nextCombinedCourseItem;
  }

  @action
  goToNextItem() {
    const item = this.args.combinedCourse.nextCombinedCourseItem;
    this.router.transitionTo(item.route, ...item.models, {
      queryParams: { redirection: item.redirection },
    });
  }

  @action
  getCurrentStep() {
    return this.step++;
  }

  @action
  setSelectedItem(item) {
    this.selectedItem = item;
  }

  <template>
    <section class="combined-course">
      <div class="combined-course__exit">
        <PixButtonLink @variant="tertiary" @route="authenticated" @iconAfter="doorOpen">
          {{t "common.actions.quit"}}
        </PixButtonLink>
      </div>
      <div>
        {{#each @combinedCourse.items as |item index|}}
          {{#unless @combinedCourse.areItemsOfTheSameType}}
            {{#if (@combinedCourse.isPreviousItemDifferent index)}}
              <Step @stepNumber={{this.getCurrentStep}} @stepType={{item.type}} />
            {{/if}}
          {{/unless}}
          <button onClick={{fn this.setSelectedItem item}} class="combined-course__step-item-button" type="button">
            <CombinedCourseStepItem
              @item={{item}}
              @isLocked={{item.isLocked}}
              @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem item}}
              @isCombinedCourseCompleted={{eq @combinedCourse.status "COMPLETED"}}
            />
          </button>
        {{/each}}
      </div>
      <StepDetails
        @item={{this.selectedItem}}
        @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem this.selectedItem}}
      />
    </section>
  </template>
}
