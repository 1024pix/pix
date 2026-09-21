import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { and, eq } from 'ember-truth-helpers';
import Attestation from 'mon-pix/components/combined-course/attestation';
import CombinedCourseItemsList from 'mon-pix/components/combined-course/combined-course-items-list';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import { CombinedCourseStatuses } from 'mon-pix/models/combined-course';

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

export default class CombinedCoursePresentation extends Component {
  @service currentUser;
  @service session;
  @service featureToggles;
  @service intl;
  @service store;
  @service router;

  @action
  async startQuestParticipation() {
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
  async goToItem(item) {
    if (this.args.combinedCourse.status === 'NOT_STARTED') {
      const combinedCourseAdapter = this.store.adapterFor('combined-course');
      await combinedCourseAdapter.start(this.args.combinedCourse.code);
    }
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

  <template>
    <main class="combined-course">
      <nav class="combined-course__exit">
        <PixButtonLink @variant="tertiary" @route="authenticated" @iconAfter="doorOpen">
          {{t "common.actions.quit"}}
        </PixButtonLink>
      </nav>
      <article>
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
        <article class="combined-course__content">
          <CombinedCourseItemsList
            @combinedCourse={{@combinedCourse}}
            @displayNextItemTag={{true}}
            @onClick={{this.goToItem}}
          />
        </article>
      </article>
    </main>
  </template>
}
