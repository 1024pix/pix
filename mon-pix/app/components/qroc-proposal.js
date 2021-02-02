import { action } from '@ember/object';
import Component from '@glimmer/component';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class QrocProposal extends Component {

  get _blocks() {
    return proposalsAsBlocks(this.args.proposals).map((block) => {
      block.randomName = generateRandomString(block.input);
      return block;
    });
  }

  get userAnswer() {
    const answer = this.args.answerValue || '';
    return answer.indexOf('#ABAND#') > -1 ? '' : answer;
  }

  @action
  onInputChange() {
    this.args.answerChanged();
  }

}
