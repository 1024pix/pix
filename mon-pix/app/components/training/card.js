import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class Card extends Component {
  @service intl;

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
    return 'tertiary';
  }

  get imageSrc() {
    const randomNumber = this._getRandomImageNumber();
    if (this.args.training.isAutoformation) {
      return `https://images.pix.fr/contenu-formatif/type/Autoformation-${randomNumber}.svg`;
    }
    if (this.args.training.isElearning) {
      return 'https://images.pix.fr/contenu-formatif/type/E-learning-1.svg';
    }
    if (this.args.training.isHybrid) {
      return 'https://images.pix.fr/contenu-formatif/type/Hybrid-1.svg';
    }
    if (this.args.training.isInPerson) {
      return 'https://images.pix.fr/contenu-formatif/type/In-person-1.svg';
    }
    return `https://images.pix.fr/contenu-formatif/type/Webinaire-${randomNumber}.svg`;
  }

  _getRandomImageNumber() {
    const min = 1;
    const max = 3;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
