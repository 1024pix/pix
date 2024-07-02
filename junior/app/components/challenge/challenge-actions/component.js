import Component from '@glimmer/component';

export default class ChallengeActions extends Component {
  get hideSkipButton() {
    return this.args.level === 'TUTORIAL' || this.args.answerHasBeenValidated;
  }
}
