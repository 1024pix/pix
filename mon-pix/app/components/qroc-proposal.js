import { action } from '@ember/object';
import Component from '@glimmer/component';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class QrocProposal extends Component {

  get _blocks() {
    return proposalsAsBlocks(this.args.proposals);
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
