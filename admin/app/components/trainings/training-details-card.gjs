import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import { localeCategories, typeCategories } from '../../models/training';
import Card from '../card';

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

  <template>
    <section class="admin-form__content">
      <Card
        class="admin-form__card organization-information-section__card organization-information-section__card--general"
        @title={{t "components.organizations.creation.general-information"}}
      >
        <div class="organization-information-section__left-block">
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t "pages.trainings.training.details.title"}}</span>
            <span class="organization-information-section__value">{{@training.title}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "pages.trainings.training.details.publishedOn"
              }}</span>
            <span class="organization-information-section__value">
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
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "pages.trainings.training.details.contentType"
              }}</span>
            <span class="organization-information-section__value"> {{this.typeLabel}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">
              {{t "pages.trainings.training.details.duration"}}
            </span>
            <span class="organization-information-section__value">{{this.formattedDuration}}</span>
          </div>
        </div>
        <div class="organization-information-section__right-block">
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">
              {{t "pages.trainings.training.details.locales" count=@training.locales.length}}
            </span>
            <span class="organization-information-section__value">{{this.formattedLocales}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "pages.trainings.training.details.editorName"
              }}</span>
            <span class="organization-information-section__value">{{@training.editorName}}</span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t
                "pages.trainings.training.details.editorLogo"
              }}</span>
            <span class="organization-information-section__value"><a
                href={{@training.editorLogoUrl}}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={{t "pages.trainings.training.details.editor-logo-aria-label"}}
              >
                {{@training.editorLogoUrl}}
              </a></span>
          </div>
          <div class="organization-information-section__field">
            <span class="organization-information-section__label">{{t "pages.trainings.training.details.status"}}</span>
            <span class="organization-information-section__value">{{if
                @training.isRecommendable
                (t "pages.trainings.training.details.status-label.enabled")
                (t "pages.trainings.training.details.status-label.disabled")
              }}</span>
          </div>
        </div>
      </Card>
    </section>
  </template>
}
