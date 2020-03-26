import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

@classic
@classNames('qrocm-proposal')
export default class QrocmProposal extends Component {
  proposals = null;
  answersValue = null;
  answerChanged = null; // action
  format = null;

  @computed('proposals')
  get _blocks() {
    return proposalsAsBlocks(this.proposals)
      .map((block) => {
        block.showText = block.text && !block.ariaLabel && !block.input;
        return block;
      });
  }

  @action
  onInputChange() {
    this.answerChanged();
  }
}
