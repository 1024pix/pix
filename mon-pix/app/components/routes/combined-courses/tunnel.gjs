import { PixButton, PixButtonLink } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';
import { eq } from 'ember-truth-helpers';
import CombinedCourseItemsList from 'mon-pix/components/combined-course/combined-course-items-list';
import StepDetails from 'mon-pix/components/combined-course/tunnel/step-details';
import { CombinedCourseStatuses } from 'mon-pix/models/combined-course';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';

const onStart = modifier((el) => {
  console.log(el);
})

export default class CombinedCourseTunnel extends Component {
  constructor() {
    super(...arguments);

    const nextItem = this.args.combinedCourse.nextCombinedCourseItem;
    if (!nextItem) {
      this.router.replaceWith('combined-courses.combined-course.presentation', this.args.combinedCourse.code);
    }
    this.selectedItem = nextItem;
  }

  @service currentUser;
  @service session;
  @service featureToggles;
  @service intl;
  @service store;
  @service router;

  @tracked selectedItem;

  @action
  goToItem(item) {
    let itemTunnelRoute = item.route;
    if (item.type === CombinedCourseItemTypes.MODULE) {
      itemTunnelRoute = itemTunnelRoute + '.passage';
    }

    this.router.transitionTo(itemTunnelRoute, ...item.models, {
      queryParams: { redirection: item.redirection },
    });
  }

  get shouldDisplayRetryModulesText() {
    return (
      this.args.combinedCourse.hasItemOfTypeModule &&
      this.args.combinedCourse.status === CombinedCourseStatuses.COMPLETED
    );
  }

  @action
  setSelectedItem(item) {
    this.selectedItem = item;
  }

  <template>
    <main class="combined-course-tunnel" {{onStart}}>
      <nav class="combined-course-tunnel__exit">
        <PixButtonLink @variant="tertiary" @route="authenticated" @iconAfter="close">
          {{t "common.actions.quit"}}
        </PixButtonLink>
      </nav>
      <article class="combined-course__content combined-course__content--tunnel">
        <CombinedCourseItemsList
          @combinedCourse={{@combinedCourse}}
          @onClick={{this.setSelectedItem}}
          @selectedItem={{this.selectedItem}}
        />
      </article>
      <aside class="step-details" id="step-details">
        <StepDetails
          @item={{this.selectedItem}}
          @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem this.selectedItem}}
          @onClick={{this.goToItem}}
        />
      </aside>
    </main>
    <nav class="combined-course-tunnel-sticky">
      <h1 class="combined-course-tunnel-sticky__title">{{this.selectedItem.title}}</h1>
      <PixButton class="combined-course-tunnel-sticky__cta" @triggerAction={{fn @onClick this.selectedItem}}>
        {{t "pages.combined-courses.items.start-campaign"}}
      </PixButton>

    </nav>
  </template>
}
