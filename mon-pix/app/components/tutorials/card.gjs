import PixBlock from '@1024pix/pix-ui/components/pix-block';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsDurationHumanize from 'ember-dayjs/helpers/dayjs-duration-humanize';
import t from 'ember-intl/helpers/t';
import ActionChip from 'mon-pix/components/action-chip';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';
import { normalizeAndRemoveAccents } from 'mon-pix/utils/tolerances-validation';

export default class Card extends Component {
  <template>
    <li>
      <PixBlock class="tutorial-card" role="article">
        <div class="tutorial-card__content">
          <h4 class="tutorial-card-content__title">
            <a
              target="_blank"
              referrerpolicy="strict-origin"
              href="{{@tutorial.link}}"
              title="{{@tutorial.title}}"
              {{on "click" this.trackAccess}}
            >
              {{@tutorial.title}}
            </a>
          </h4>
          <p class="tutorial-card-content__details">
            {{@tutorial.source}}
            •
            {{t (concat "pages.tutorial-panel.format." (normalizeAndRemoveAccents @tutorial.format))}}
            •
            {{dayjsDurationHumanize @tutorial.duration "seconds"}}
          </p>
          {{#if this.shouldShowActions}}
            <ul class="tutorial-card-content__actions">
              <li>
                <ActionChip
                  @title={{this.evaluateInformation}}
                  @isCompleted={{this.isTutorialEvaluated}}
                  @triggerAction={{this.evaluateTutorial}}
                  @icon="thumbUp"
                />
              </li>
              <li>
                <ActionChip
                  @title={{this.saveInformation}}
                  @isCompleted={{this.isTutorialSaved}}
                  @triggerAction={{this.toggleSaveTutorial}}
                  @icon="bookmark"
                />
              </li>
            </ul>
          {{/if}}
        </div>
      </PixBlock>
    </li>
  </template>
  @service intl;
  @service store;
  @service currentUser;
  @service pixMetrics;
  @service router;

  @tracked savingStatus;
  @tracked evaluationStatus;

  constructor(owner, args) {
    super(owner, args);
    this.savingStatus = args.tutorial.isSaved ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
    this.evaluationStatus = args.tutorial.isEvaluated ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
  }

  get shouldShowActions() {
    return !!this.currentUser.user;
  }

  get saveInformation() {
    return this.savingStatus === buttonStatusTypes.recorded
      ? this.intl.t('pages.user-tutorials.list.tutorial.actions.remove.label')
      : this.intl.t('pages.user-tutorials.list.tutorial.actions.save.label');
  }

  get evaluateInformation() {
    return this.evaluationStatus === buttonStatusTypes.recorded
      ? this.intl.t('pages.user-tutorials.list.tutorial.actions.evaluate.label')
      : this.intl.t('pages.user-tutorials.list.tutorial.actions.evaluate.extra-information');
  }

  get isSaved() {
    return this.savingStatus === buttonStatusTypes.recorded;
  }

  get isTutorialEvaluated() {
    return this.evaluationStatus !== buttonStatusTypes.unrecorded;
  }

  get isTutorialSaved() {
    return this.savingStatus !== buttonStatusTypes.unrecorded;
  }

  @action
  async toggleSaveTutorial() {
    if (this.isSaved) {
      await this._removeTutorial();
    } else {
      await this._saveTutorial();
    }
  }

  async _saveTutorial() {
    try {
      const userSavedTutorial = this.store.createRecord('user-saved-tutorial', { tutorial: this.args.tutorial });
      await userSavedTutorial.save();
      this.savingStatus = buttonStatusTypes.recorded;
    } catch {
      this.savingStatus = buttonStatusTypes.unrecorded;
    }
  }

  async _removeTutorial() {
    try {
      await this.args.tutorial.userSavedTutorial.destroyRecord();
      this.savingStatus = buttonStatusTypes.unrecorded;
    } catch {
      this.savingStatus = buttonStatusTypes.recorded;
    }
    await this.args.afterRemove?.();
  }

  @action
  async evaluateTutorial() {
    const tutorial = this.args.tutorial;
    const tutorialEvaluation =
      tutorial.tutorialEvaluation ?? this.store.createRecord('tutorial-evaluation', { tutorial: tutorial });
    try {
      await tutorialEvaluation.save({
        adapterOptions: { tutorialId: tutorial.id, status: tutorialEvaluation.nextStatus },
      });
    } catch {
      throw new Error("Un problème est survenu lors de la mise à jour de l'évaluation du tutoriel");
    } finally {
      this.evaluationStatus = tutorialEvaluation.isLiked ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
    }
  }

  @action
  trackAccess() {
    this.pixMetrics.trackEvent(`Ouvre le tutoriel`, {
      category: 'Accès tuto',
      action: `Clic depuis : ${this.router.currentRouteName}`,
      title: this.args.tutorial.title,
    });
  }
}
