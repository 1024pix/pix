import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
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
  postMessageHandler = null;

  @computed('proposals')
  get _blocks() {
    return proposalsAsBlocks(this.proposals);
  }

  @computed('answerValue')
  get userAnswer() {
    const answer = this.answerValue || '';
    return answer.indexOf('#ABAND#') > -1 ? '' : answer;
  }
  _setAnswerValue(event) {
    this.set('answerValue', event.data) ;
  }

  didUpdateAttrs() {
    this.set('userAnswer', '');
  }

  didInsertElement() {
    this.postMessageHandler = this._setAnswerValue.bind(this);
    window.addEventListener('message', this.postMessageHandler);

    this.$('input').keydown(() => {
      this.answerChanged();
    });
  }

  didDestroyElement() {
    window.removeEventListener('message',this.postMessageHandler);
  }

  willRender() {
    this.notifyPropertyChange('proposals');
  }
}
