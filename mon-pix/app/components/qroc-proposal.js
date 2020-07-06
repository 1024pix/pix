/* eslint ember/no-classic-components: 0 */
/* eslint ember/no-component-lifecycle-hooks: 0 */
/* eslint ember/require-tagless-components: 0 */

import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

@classic
@classNames('qroc-proposal')
export default class QrocProposal extends Component {
  format = null;
  proposals = null;
  answerValue = null;
  answerChanged = null; // action

  @computed('proposals')
  get _blocks() {
    return proposalsAsBlocks(this.proposals);
  }

  @computed('answerValue')
  get userAnswer() {
    const answer = this.answerValue || '';
    return answer.indexOf('#ABAND#') > -1 ? '' : answer;
  }

  @action
  onInputChange() {
    this.answerChanged();
  }

  willRender() {
    this.notifyPropertyChange('proposals');
  }
}
