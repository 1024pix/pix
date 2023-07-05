import Component from '@glimmer/component';

export default class BadgeCard extends Component {
  get showProgression() {
    return this.args.isAlwaysVisible && !this.args.isAcquired;
  }
}
