import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import _ from 'lodash';
import jsyaml from 'js-yaml';

const classByResultValue = {
  ok: 'correction-qroc-box__input-right-answer',
  ko: '',
  partially: '',
  aband: 'correction-qroc-box__input-no-answer'
};

export default Component.extend({

  inputFields: computed('challenge.proposals', 'answer.value', function() {
    const escapedProposals = this.get('challenge.proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    const answers = answersAsObject(this.get('answer.value'), _.keys(labels));

    return Object.keys(labels).map((key) => {
      const answerIsEmpty = answers[key] === '';

      return {
        label: labels[key],
        answer: answerIsEmpty ? 'Pas de réponse' : answers[key],
        inputClass: answerIsEmpty ? classByResultValue['aband'] : this.inputClass,
      };
    });
  }),

  answerIsCorrect: computed('answer.result', function() {
    return this.answer.result === 'ok';
  }),

  inputClass: computed('answer.result', function() {
    return classByResultValue[this.answer.result];
  }),

  expectedAnswers: computed('solution', 'inputFields.length', function() {
    const inputFieldsCount = this.inputFields.length;
    const solutions = jsyaml.safeLoad(this.solution);
    const solutionsKeys = Object.keys(solutions);

    const expectedAnswers = solutionsKeys.slice(0, inputFieldsCount).map((key) => {
      return solutions[key][0];
    });

    return inputFieldsCount === solutionsKeys.length ?
      `${expectedAnswers.slice(0, -1).join(', ')} et ${expectedAnswers.slice(-1)}` :
      `${expectedAnswers.join(' ou ')} ou ...`;
  })

});
