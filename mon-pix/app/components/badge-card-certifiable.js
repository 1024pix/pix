import Component from '@glimmer/component';

export default class BadgeCardCertifiable extends Component {
  get isStillValid() {
    return this.args.isValid && this.args.isAcquired;
  }

  get showProgression() {
    return !this.args.isValid || (this.args.isAlwaysVisible && !this.args.isAcquired);
  }
}
