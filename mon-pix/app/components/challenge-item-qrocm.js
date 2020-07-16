import { action } from '@ember/object';
import _ from 'lodash';
import { inject as service } from '@ember/service';

import ChallengeItemGeneric from './challenge-item-generic';
import jsyaml from 'js-yaml';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class ChallengeItemQrocm extends ChallengeItemGeneric {
  @service intl;

  answersValue = {};

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
    return _.filter(answers, _.isEmpty).length;
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
}

