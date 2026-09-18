import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import CombinedCourseItemsList from 'mon-pix/components/combined-course/combined-course-items-list';
import StepDetails from 'mon-pix/components/combined-course/tunnel/step-details';
import { CombinedCourseStatuses } from 'mon-pix/models/combined-course';

export default class CombinedCourseTunnel extends Component {
  constructor() {
    super(...arguments);

    this.selectedItem = this.args.combinedCourse.nextCombinedCourseItem;
  }

  @service currentUser;
  @service session;
  @service featureToggles;
  @service intl;
  @service store;
  @service router;

  @tracked selectedItem;

  @action
  goToNextItem() {
    const item = this.args.combinedCourse.nextCombinedCourseItem;
    this.router.transitionTo(item.route, ...item.models, {
      queryParams: { redirection: item.redirection },
    });
  }

  get isSurveyEnabled() {
    return this.featureToggles.featureToggles?.isSurveyEnabledForCombinedCourses && this.args.combinedCourse.surveyUrl;
  }

  get shouldDisplayRetryModulesText() {
    return (
      this.args.combinedCourse.hasItemOfTypeModule &&
      this.args.combinedCourse.status === CombinedCourseStatuses.COMPLETED
    );
  }

  @action
  setSelectedItem(item) {
    console.log('item', item);
    this.selectedItem = item;
  }

  <template>
    <main class="combined-course-tunnel">
      <nav class="combined-course-tunnel__exit">
        <PixButtonLink @variant="tertiary" @route="authenticated" @iconAfter="doorOpen">
          {{t "common.actions.quit"}}
        </PixButtonLink>
      </nav>
      <article class="combined-course__content combined-course__content--tunnel">
        <CombinedCourseItemsList @combinedCourse={{@combinedCourse}} @onClick={{this.setSelectedItem}} />
      </article>
      <aside class="step-details">
        <StepDetails
          @item={{this.selectedItem}}
          @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem this.selectedItem}}
          @onClick={{this.goToNextItem}}
        />
      </aside>
    </main>
  </template>
}
