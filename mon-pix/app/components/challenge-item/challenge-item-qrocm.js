import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import jsyaml from 'js-yaml';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

import ChallengeItemGeneric from './challenge-item-generic';

export default class ChallengeItemQrocm extends ChallengeItemGeneric {
  @service intl;

  @tracked answersValue = {};

  constructor() {
    super(...arguments);
    this.answersValue = this._extractProposals();

    if (this.args.answer) {
      this.answersValue = this.args.answer._valuesAsMap;
    }
  }

  _extractProposals() {
    const proposals = proposalsAsBlocks(this.args.challenge.proposals);
    const inputFieldsNames = {};

    proposals.forEach(({ input }) => {
      if (input) {
        inputFieldsNames[input] = '';
      }
    });

    return inputFieldsNames;
  }

  _hasError() {
    const allAnswers = this.answersValue;
    return this._hasEmptyAnswerFields(allAnswers);
  }

  _hasEmptyAnswerFields(answers) {
    return filter(answers, isEmpty).length;
  }

  _getAnswerValue() {
    return jsyaml.safeDump(this.answersValue);
  }

  _getErrorMessage() {
    return this.intl.t('pages.challenge.skip-error-message.qrocm');
  }

  @action
  answerChanged() {
    this.errorMessage = null;
  }

  @action
  onChangeSelect(value) {
    this.answersValue = value;
  }
}
