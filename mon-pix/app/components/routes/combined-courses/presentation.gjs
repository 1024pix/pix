import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { get } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { and, eq } from 'ember-truth-helpers';
import Attestation from 'mon-pix/components/combined-course/attestation';
import CombinedCourseItem from 'mon-pix/components/combined-course/combined-course-item';
import NestedGroup from 'mon-pix/components/combined-course/nested-group';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import { CombinedCourseStatuses } from 'mon-pix/models/combined-course';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';

const CompletedText = <template>
  <div class="completed-text">
    <h2 class="completed-text__title">{{t "pages.combined-courses.completed.title"}}</h2>
    <p class="completed-text__description">{{t "pages.combined-courses.completed.description"}}</p>
  </div>
</template>;

const Header = <template>
  <header class="combined-course-header">
    <div class="combined-course-header__text">
      <h1>{{@combinedCourse.name}}</h1>

      {{#if (eq @combinedCourse.status "COMPLETED")}}
        <div class="combined-course-header__completed">
          <img src="/images/illustrations/combined-course/completed.svg" alt="" role="presentation" />
          <CompletedText />
        </div>
      {{/if}}

      <div class={{unless (eq @combinedCourse.status "COMPLETED") "combined-course__description"}}>
        <MarkdownToHtml @markdown={{@combinedCourse.description}} @mustReplaceLinksFromMarkdown={{true}} />
      </div>

      {{#if (eq @combinedCourse.status "NOT_STARTED")}}
        <PixButton @type="submit" @triggerAction={{@startQuestParticipation}} @loading-color="white" @size="large">{{t
            "pages.combined-courses.content.start-button"
          }}
        </PixButton>
      {{else if (eq @combinedCourse.status "STARTED")}}
        <PixButton @type="submit" @triggerAction={{@goToNextItem}} @loading-color="white" @size="large">{{t
            "pages.combined-courses.content.resume-button"
          }}
        </PixButton>
      {{/if}}
      {{#if (and (eq @combinedCourse.status "COMPLETED") @isSurveyEnabled)}}
        <PixTooltip @id="tooltip-satisfaction-survey" @position="right" @isInline={{true}}>
          <:triggerElement>
            <PixButtonLink
              @href={{@combinedCourse.surveyUrl}}
              target="_blank"
              rel="noopener noreferrer"
              @size="large"
              class="survey-button"
            >{{t "pages.combined-courses.completed.survey-button"}}</PixButtonLink>
          </:triggerElement>
          <:tooltip>
            <span>{{t "pages.combined-courses.completed.survey-button-description"}}</span>
          </:tooltip>
        </PixTooltip>

      {{/if}}
    </div>
    <img alt="" role="presentation" src={{@combinedCourse.illustration}} width="320" />
  </header>
</template>;

const Step = <template>
  <h2 class="combined-course__step-title">{{t "pages.combined-courses.content.step" stepNumber=@stepNumber}}
  </h2>
</template>;

export default class CombinedCoursePresentation extends Component {
  <template>
    <section class="combined-course">
      <div class="combined-course__exit">
        <PixButtonLink @variant="tertiary" @route="authenticated" @iconAfter="doorOpen">
          {{t "common.actions.quit"}}
        </PixButtonLink>
      </div>
      <Header
        @combinedCourse={{@combinedCourse}}
        @startQuestParticipation={{this.startQuestParticipation}}
        @goToNextItem={{this.goToNextItem}}
        @isSurveyEnabled={{this.isSurveyEnabled}}
      />
      {{#if (eq @combinedCourse.reward.type "attestations")}}
        <Attestation @attestation={{@combinedCourse.reward}} />
      {{/if}}
      <hr class="combined-course__divider" />
      {{#if this.shouldDisplayRetryModulesText}}
        <p class="combined-course__retry-text">{{t "pages.combined-courses.completed.retry-text"}}</p>
      {{/if}}
      {{#each @combinedCourse.items as |item index|}}
        {{#unless @combinedCourse.areItemsOfTheSameType}}
          {{#if (@combinedCourse.isPreviousItemDifferent index)}}
            <Step @stepNumber={{get this.stepNumbers index}} />
          {{/if}}
        {{/unless}}
        {{#if (eq item.type CombinedCourseItemTypes.COMBINED_COURSE)}}
          <NestedGroup @item={{item}} @isCurrent={{eq @combinedCourse.nextCombinedCourseItem item}} />
        {{else}}
          <CombinedCourseItem
            @item={{item}}
            @isLocked={{item.isLocked}}
            @isNextItemToComplete={{eq @combinedCourse.nextCombinedCourseItem item}}
            @onClick={{if (eq @combinedCourse.status "NOT_STARTED") this.startQuestParticipation noop}}
            @isCombinedCourseCompleted={{eq @combinedCourse.status "COMPLETED"}}
          />
        {{/if}}
      {{/each}}
    </section>
  </template>

  @service currentUser;
  @service session;
  @service featureToggles;
  @service intl;
  @service store;
  @service router;

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
    if (!item) return;

    // a nested course is not a destination: dive into its next activity
    const target = item.type === CombinedCourseItemTypes.COMBINED_COURSE ? item.nextActivity : item;
    if (!target) return;

    this.router.transitionTo(target.route, ...target.models, {
      queryParams: { redirection: target.redirection },
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

  // derived from the items rather than counted during render: a counter incremented
  // by the template drifts on every re-render (Étape 3, Étape 4 on the second one)
  get stepNumbers() {
    let step = 0;
    let previousType = null;
    return this.args.combinedCourse.items.map((item) => {
      if (item.typeForStepDisplay !== previousType) {
        step += 1;
        previousType = item.typeForStepDisplay;
      }
      return step;
    });
  }
}

function noop() {}
