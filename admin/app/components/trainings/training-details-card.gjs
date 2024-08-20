import Component from '@glimmer/component';

import { localeCategories } from '../../models/training';
import StateTag from './state-tag';

export default class TrainingDetailsCard extends Component {
  get formattedDuration() {
    const days = this.args.training.duration.days ? `${this.args.training.duration.days}j ` : '';
    const hours = this.args.training.duration.hours ? `${this.args.training.duration.hours}h ` : '';
    const minutes = this.args.training.duration.minutes ? `${this.args.training.duration.minutes}min` : '';
    return `${days}${hours}${minutes}`.trim();
  }

  get formattedLocale() {
    return localeCategories[this.args.training.locale];
  }

  <template>
    {{! template-lint-disable no-redundant-role }}
    <article class="training-details-card" role="article">
      <div class="training-details-card__content">
        <h1 class="training-details-card__title">{{@training.title}}</h1>
        <StateTag @isDisabled={{@training.isDisabled}} />
        <dl class="training-details-card__details">
          <dt class="training-details-card__details-label">Publié sur&nbsp;:&nbsp;</dt>
          <dd class="training-details-card__details-value">
            <a
              href={{@training.link}}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="{{@training.link}} (nouvelle fenêtre)"
            >
              {{@training.link}}
            </a>
          </dd>
          <dt class="training-details-card__details-label">Type de contenu&nbsp;:&nbsp;</dt>
          <dd class="training-details-card__details-value">{{@training.type}}</dd>
          <dt class="training-details-card__details-label">Durée&nbsp;:&nbsp;</dt>
          <dd class="training-details-card__details-value">{{this.formattedDuration}}</dd>
          <dt class="training-details-card__details-label">Langue localisée&nbsp;:&nbsp;</dt>
          <dd class="training-details-card__details-value">{{this.formattedLocale}}</dd>
          <dt class="training-details-card__details-label">Nom d'éditeur&nbsp;:&nbsp;</dt>
          <dd class="training-details-card__details-value">{{@training.editorName}}</dd>
          <dt class="training-details-card__details-label">Logo de l'éditeur&nbsp;:&nbsp;</dt>
          <dd class="training-details-card__details-value">{{@training.editorLogoUrl}}</dd>
          <dt class="training-details-card__details-label">Statut&nbsp;:&nbsp;</dt>
          <dd class="training-details-card__details-value">{{if
              @training.isRecommendable
              "Déclenchable"
              "Non déclenchable"
            }}</dd>
        </dl>
      </div>
      <img class="training-details-card__editor-logo" src={{@training.editorLogoUrl}} alt={{@training.editorName}} />
    </article>
  </template>
}
