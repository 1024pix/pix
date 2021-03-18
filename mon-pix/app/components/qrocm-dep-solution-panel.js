import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import keys from 'lodash/keys';
import jsyaml from 'js-yaml';
import { inject as service } from '@ember/service';

const classByResultValue = {
  ok: 'correction-qroc-box-answer--correct',
  ko: '',
  partially: '',
  aband: 'correction-qroc-box-answer--aband',
};

export default class QrocmDepSolutionPanel extends Component {
  @service intl;

  get inputFields() {
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    const answers = answersAsObject(this.args.answer.value, keys(labels));

    return Object.keys(labels).map((key) => {
      const answerIsEmpty = answers[key] === '';

      return {
        label: labels[key],
        answer: answerIsEmpty ? this.intl.t('pages.result-item.aband') : answers[key],
        inputClass: answerIsEmpty ? classByResultValue['aband'] : this.inputClass,
      };
    });
  }

  get answerIsCorrect() {
    return this.args.answer.result === 'ok';
  }

  get inputClass() {
    return classByResultValue[this.args.answer.result];
  }

  get understandableSolution() {
    if (this.args.solutionToDisplay) {
      return this.args.solutionToDisplay;
    }
    const inputFieldsCount = this.inputFields.length;
    const solutions = jsyaml.safeLoad(this.args.solution);
    const solutionsKeys = Object.keys(solutions);

    const expectedAnswers = solutionsKeys.slice(0, inputFieldsCount).map((key) => {
      return solutions[key][0];
    });

    return inputFieldsCount === solutionsKeys.length ?
      `${expectedAnswers.slice(0, -1).join(', ')} et ${expectedAnswers.slice(-1)}` :
      `${expectedAnswers.join(' ou ')} ou ...`;
  }
}
