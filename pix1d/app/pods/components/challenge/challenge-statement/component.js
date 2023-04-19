import Component from '@glimmer/component';

export default class ChallengeStatement extends Component {
  get challengeInstruction() {
    return this.args.challenge.instruction;
  }

  get challengeEmbedDocument() {
    if (this.args.challenge?.hasValidEmbedDocument) {
      return {
        url: this.args.challenge.embedUrl,
        title: this.args.challenge.embedTitle,
        height: this.args.challenge.embedHeight,
      };
    }
    return undefined;
  }
}
