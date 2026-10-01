import { PixBlock, PixTag } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Card extends Component {
  <template>
    <PixBlock class="training-card" @shadow="light">
      <a class="training-card__content" href={{@training.link}} target="_blank" {{on "click" this.trackAccess}}>
        <h3 class="training-card-content__title">{{@training.title}}</h3>
        <div class="training-card-content__infos" title="{{this.tagTitle}}">
          <PixTag @color={{this.tagColor}} class="training-card-content-infos__tag">
            <ul class="training-card-content-infos-tag__list">
              <li class="training-card-content-infos-tag-list__type">
                {{this.type}}
              </li>
              <li class="training-card-content-infos-tag-list__duration">
                <time>{{this.durationFormatted}}</time>
              </li>
            </ul>
          </PixTag>
        </div>
        <div class="training-card-content__illustration">
          <img
            class="training-card-content-illustration__logo"
            src={{@training.editorLogoUrl}}
            alt={{this.alternativeTextLogo}}
          />
          {{! template-lint-disable require-valid-alt-text }}
          <img class="training-card-content-illustration__image" src={{this.imageSrc}} alt />
        </div>
      </a>
    </PixBlock>
  </template>
  @service intl;
  @service pixMetrics;
  @service router;

  get durationFormatted() {
    const days = this.args.training.duration.days ? `${this.args.training.duration.days}j ` : '';
    const hours = this.args.training.duration.hours ? `${this.args.training.duration.hours}h ` : '';
    const minutes = this.args.training.duration.minutes ? `${this.args.training.duration.minutes}min` : '';
    return `${days}${hours}${minutes}`.trim();
  }

  get type() {
    return this.intl.t(`pages.training.type.${this.args.training.type}`);
  }

  get alternativeTextLogo() {
    return `${this.intl.t('pages.training.editor')} ${this.args.training.editorName}`;
  }

  get tagTitle() {
    return `${this.type} - ${this.durationFormatted}`;
  }

  get tagColor() {
    if (this.args.training.isAutoformation) {
      return 'primary';
    }
    if (this.args.training.isElearning) {
      return 'success';
    }
    if (this.args.training.isHybrid) {
      return 'error';
    }
    if (this.args.training.isInPerson) {
      return 'secondary';
    }
    if (this.args.training.isModulix) {
      return 'primary';
    }
    return 'tertiary';
  }

  get imageSrc() {
    const randomNumber = this._getRandomImageNumber();
    if (this.args.training.isAutoformation) {
      return `https://assets.pix.org/contenu-formatif/type/Autoformation-${randomNumber}.svg`;
    }
    if (this.args.training.isElearning) {
      return 'https://assets.pix.org/contenu-formatif/type/E-learning-1.svg';
    }
    if (this.args.training.isHybrid) {
      return 'https://assets.pix.org/contenu-formatif/type/Hybrid-1.svg';
    }
    if (this.args.training.isInPerson) {
      return 'https://assets.pix.org/contenu-formatif/type/In-person-1.svg';
    }
    if (this.args.training.isModulix) {
      return `https://assets.pix.org/contenu-formatif/type/Modulix-${randomNumber}.svg`;
    }
    return `https://assets.pix.org/contenu-formatif/type/Webinaire-${randomNumber}.svg`;
  }

  _getRandomImageNumber() {
    const min = 1;
    const max = 3;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  @action
  trackAccess() {
    this.pixMetrics.trackEvent(`Ouvre le cf`, {
      category: 'Accès Contenu Formatif',
      action: `Clic depuis : ${this.router.currentRouteName}`,
      title: this.args.training.title,
    });
  }
}
