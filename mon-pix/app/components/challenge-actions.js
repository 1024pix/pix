import Component from '@glimmer/component';

export default class ChallengeActions extends Component {
  get areActionButtonsDisabled() {
    return this.args.disabled || this.args.assessmentState === 'paused';
  }
}
