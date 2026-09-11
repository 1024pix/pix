import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import CombinedCourseStepItem from 'mon-pix/components/combined-course/combined-course-step-item';

const Step = <template>
  <h2 class="combined-course__step-title">{{t "pages.combined-courses.content.step" stepNumber=(@stepNumber)}}
  </h2>
</template>;

export default class TunnelSteps extends Component {
  @tracked selectedItem = null;

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
      {{#each @combinedCourse.items as |item index|}}
        {{#unless @combinedCourse.areItemsOfTheSameType}}
          {{#if (@combinedCourse.isPreviousItemDifferent index)}}
            <Step @stepNumber={{this.getCurrentStep}} />
          {{/if}}
        {{/unless}}
        <CombinedCourseStepItem
          @item={{item}}
          @isLocked={{item.isLocked}}
          @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem item}}
          @onClick={{this.setSelectedItem item}}
          @isCombinedCourseCompleted={{eq @combinedCourse.status "COMPLETED"}}
        />
      {{/each}}
    </section>
  </template>

  @service currentUser;
  @service session;
  @service featureToggles;
  @service intl;
  @service store;
  @service router;

  step = 1;

  @action
  async startQuestParticipation(e) {
    e.preventDefault();
    const combinedCourseAdapter = this.store.adapterFor('combined-course');
    await combinedCourseAdapter.start(this.args.combinedCourse.code);
    this.goToNextItem();
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
}

function noop() {}
