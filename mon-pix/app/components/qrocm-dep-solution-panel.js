import { computed } from '@ember/object';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import { htmlSafe } from '@ember/template';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import _ from 'lodash';
import jsyaml from 'js-yaml';

const classByResultValue = {
  ok: 'correction-qroc-box-answer--correct',
  ko: '',
  partially: '',
  aband: 'correction-qroc-box-answer--aband'
};

@classic
export default class QrocmDepSolutionPanel extends Component {
  @computed('challenge.proposals', 'answer.value')
  get inputFields() {
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
  }

  @computed('answer.result')
  get answerIsCorrect() {
    return this.answer.result === 'ok';
  }

  @computed('answer.result')
  get inputClass() {
    return classByResultValue[this.answer.result];
  }

  @computed('solution', 'inputFields.length')
  get expectedAnswers() {
    const inputFieldsCount = this.inputFields.length;
    const solutions = jsyaml.safeLoad(this.solution);
    const solutionsKeys = Object.keys(solutions);

    const expectedAnswers = solutionsKeys.slice(0, inputFieldsCount).map((key) => {
      return solutions[key][0];
    });

    return inputFieldsCount === solutionsKeys.length ?
      `${expectedAnswers.slice(0, -1).join(', ')} et ${expectedAnswers.slice(-1)}` :
      `${expectedAnswers.join(' ou ')} ou ...`;
  }
}
