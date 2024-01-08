import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class Card extends Component {
  @service intl;

  get durationFormatted() {
    const formattedHours = [];
    const { hours, minutes, seconds } = this.args.training.duration;
    if (hours) {
      formattedHours.push(hours + 'h');
    }
    if (minutes) {
      formattedHours.push(minutes + 'm');
    }
    if (seconds) {
      formattedHours.push(seconds + 's');
    }
    return formattedHours.join(' ');
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
      return `/images/illustrations/trainings/Autoformation-${randomNumber}.svg`;
    }
    if (this.args.training.isElearning) {
      return '/images/illustrations/trainings/E-learning-1.svg';
    }
    if (this.args.training.isHybrid) {
      return '/images/illustrations/trainings/Hybrid-1.svg';
    }
    if (this.args.training.isInPerson) {
      return '/images/illustrations/trainings/In-person-1.svg';
    }
    return `/images/illustrations/trainings/Webinaire-${randomNumber}.svg`;
  }

  _getRandomImageNumber() {
    const min = 1;
    const max = 3;
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
