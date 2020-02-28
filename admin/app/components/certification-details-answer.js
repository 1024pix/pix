import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import Component from '@glimmer/component';

@classNames('card', 'text-center', 'certification-details-answer', 'border-secondary')
export default class CertificationDetailsAnswer extends Component {

  // Properties
  answer = null;
  onUpdateRate = null;

  // Private properties
  _jury = false;

  @computed('_jury')
  get resultClass() {
    const jury = this._jury;
    return (jury) ? 'answer-result jury' : 'answer-result';
  }

  @action
  onSetResult(value) {
    const answer = this.answer;
    const jury = (value !== answer.result) ? value : false;
    answer.jury = jury;
    this.set('_jury', jury);
    this.onUpdateRate();
  }
}
