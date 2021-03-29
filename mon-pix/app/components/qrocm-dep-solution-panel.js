import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import keys from 'lodash/keys';
import jsyaml from 'js-yaml';
import { inject as service } from '@ember/service';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

const classByResultValue = {
  ok: 'correction-qroc-box-answer--correct',
  ko: '',
  partially: '',
  aband: 'correction-qroc-box-answer--aband',
};

export default class QrocmDepSolutionPanel extends Component {
  @service intl;

  get blocks() {
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    const answers = answersAsObject(this.args.answer.value, keys(labels));

    return proposalsAsBlocks(this.args.challenge.get('proposals')).map((block) => {
      const isLineBreak = block.breakline;
      if (!isLineBreak) {
        const answerIsEmpty = answers[block.input] === '';
        block.answer = answerIsEmpty ? this.intl.t('pages.result-item.aband') : answers[block.input];
        block.inputClass = answerIsEmpty ? classByResultValue['aband'] : this.inputClass;
      }
      return block;
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
    const answersCount = this._inputCount;
    const solutions = jsyaml.safeLoad(this.args.solution);
    const solutionsKeys = Object.keys(solutions);

    const expectedAnswers = solutionsKeys.slice(0, answersCount).map((key) => {
      return solutions[key][0];
    });

    return answersCount === solutionsKeys.length ?
      `${expectedAnswers.slice(0, -1).join(', ')} et ${expectedAnswers.slice(-1)}` :
      `${expectedAnswers.join(' ou ')} ou ...`;
  }

  get _inputCount() {
    return this.blocks.filter((block) => block.input && !block.breakline).length;
  }
}
