import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import CombinedCourseItem from 'mon-pix/components/combined-course/combined-course-item';

const Step = <template>
  <h2 class="combined-course__step-title">{{t "pages.combined-courses.content.step" stepNumber=(@stepNumber)}}
  </h2>
</template>;

export default class TunnelSteps extends Component {
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
        <CombinedCourseItem
          @item={{item}}
          @isLocked={{item.isLocked}}
          @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem item}}
          @onClick={{if (eq @combinedCourse.status "NOT_STARTED") this.startQuestParticipation noop}}
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
