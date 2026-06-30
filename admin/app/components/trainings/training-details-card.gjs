import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import { deliveryModeCategories, localeCategories, typeCategories } from '../../models/training';
import Card from '../card';
import SafeMarkdownToHtml from '../safe-markdown-to-html';

export default class TrainingDetailsCard extends Component {
  @service url;

  get formattedDuration() {
    const days = this.args.training.duration.days ? `${this.args.training.duration.days}j ` : '';
    const hours = this.args.training.duration.hours ? `${this.args.training.duration.hours}h ` : '';
    const minutes = this.args.training.duration.minutes ? `${this.args.training.duration.minutes}min` : '';
    return `${days}${hours}${minutes}`.trim();
  }

  get formattedLocales() {
    return this.args.training.locales.map((locale) => localeCategories[locale]).join(', ');
  }

  get trainingLink() {
    return this.args.training.type === 'modulix'
      ? `${this.url.pixAppUrl}${this.args.training.link}`
      : this.args.training.link;
  }

  get typeLabel() {
    return typeCategories[this.args.training.type];
  }

  get deliveryModeLabel() {
    return deliveryModeCategories[this.args.training.deliveryMode];
  }

  get formattedObjectives() {
    return this.args.training.objectives?.split(';').filter(Boolean) ?? [];
  }

  <template>
    <section class="admin-form__content">
      <Card class="admin-form__card training-details__card" @title={{t "common.cards.titles.general-information"}}>
        <div class="training-details__block">
          <div class="training-details__field">
            <span class="training-details__label">{{t "pages.trainings.training.details.title"}}</span>
            <span class="training-details__value">{{@training.title}}</span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">{{t "pages.trainings.training.details.publishedOn"}}</span>
            <span class="training-details__value">
              <a
                href={{this.trainingLink}}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="{{this.trainingLink}} (nouvelle fenêtre)"
              >
                {{this.trainingLink}}
              </a>
            </span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">{{t "pages.trainings.training.details.contentType"}}</span>
            <span class="training-details__value"> {{this.typeLabel}}</span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">
              {{t "pages.trainings.training.details.duration"}}
            </span>
            <span class="training-details__value">{{this.formattedDuration}}</span>
          </div>
        </div>
        <div class="training-details__block">
          <div class="training-details__field">
            <span class="training-details__label">
              {{t "pages.trainings.training.details.locales" count=@training.locales.length}}
            </span>
            <span class="training-details__value">{{this.formattedLocales}}</span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">{{t "pages.trainings.training.details.editorName"}}</span>
            <span class="training-details__value">{{@training.editorName}}</span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">{{t "pages.trainings.training.details.editorLogo"}}</span>
            <span class="training-details__value"><a
                href={{@training.editorLogoUrl}}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={{t "pages.trainings.training.details.editor-logo-aria-label"}}
              >
                {{@training.editorLogoUrl}}
              </a></span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">{{t "pages.trainings.training.details.status"}}</span>
            <span class="training-details__value">{{if
                @training.isRecommendable
                (t "pages.trainings.training.details.status-label.enabled")
                (t "pages.trainings.training.details.status-label.disabled")
              }}</span>
          </div>
        </div>
      </Card>

      <Card
        class="admin-form__card training-details__card"
        @title={{t "pages.trainings.training.details.recommendationEngine"}}
      >
        <div class="training-details__block">
          <div class="training-details__field">
            <span class="training-details__label">{{t
                "pages.trainings.training.form.recommendation-engine.description.label"
              }}</span>
            <span class="training-details__value"><SafeMarkdownToHtml
                class="target-profile-details__description"
                @markdown={{@training.description}}
              /></span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">
              {{t "pages.trainings.training.form.recommendation-engine.program.label"}}
            </span>
            <span class="training-details__value">{{@training.program}}</span>
          </div>
        </div>
        <div class="training-details__block">
          <div class="training-details__field">
            <span class="training-details__label">{{t
                "pages.trainings.training.form.recommendation-engine.delivery-mode.label"
              }}</span>
            <span class="training-details__value">
              {{this.deliveryModeLabel}}
            </span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">{{t
                "pages.trainings.training.form.recommendation-engine.registration-required.label"
              }}</span>
            <span class="training-details__value">{{if
                @training.registrationRequired
                (t "common.words.yes")
                (t "common.words.no")
              }}</span>
          </div>
          <div class="training-details__field">
            <span class="training-details__label">
              {{t "pages.trainings.training.form.recommendation-engine.objectives.label"}}
            </span>
            <ul class="training-details__value training-details__list">
              {{#each this.formattedObjectives as |objective|}}
                <li>{{objective}}</li>
              {{/each}}
            </ul>
          </div>
        </div>
      </Card>
    </section>
  </template>
}
