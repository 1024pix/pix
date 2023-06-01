import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import keys from 'lodash/keys';
import jsyaml from 'js-yaml';
import { inject as service } from '@ember/service';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class QrocmDepSolutionPanel extends Component {
  @service intl;

  get blocks() {
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    const answers = answersAsObject(this.args.answer.value, keys(labels));
    const correctionBlocks = this.args.correctionBlocks ? [...this.args.correctionBlocks] : null;

    return proposalsAsBlocks(this.args.challenge.get('proposals')).map((block) => {
      if (!block.input || !correctionBlocks) {
        return block;
      }
      const correctionBlock = correctionBlocks.shift();
      const isAnswerEmpty = answers[block.input] === '';
      block.answer = isAnswerEmpty ? this.intl.t('pages.result-item.aband') : answers[block.input];
      block.inputClass = this.getInputClass(isAnswerEmpty, correctionBlock?.validated);
      block.ariaLabel = this.getAriaLabel(isAnswerEmpty, correctionBlock?.validated);
      return block;
    });
  }

  get answerIsCorrect() {
    return this.args.answer.result === 'ok';
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

    return answersCount === solutionsKeys.length
      ? `${expectedAnswers.slice(0, -1).join(', ')} et ${expectedAnswers.slice(-1)}`
      : `${expectedAnswers.join(' ou ')} ou ...`;
  }

  get _inputCount() {
    return this.blocks.filter((block) => block.input && !block.breakline).length;
  }

  getInputClass(isEmptyAnswer, isCorrectAnswer) {
    const CSS_PREPEND = 'correction-qroc-box-answer--';
    switch (true) {
      case isEmptyAnswer:
        return `${CSS_PREPEND}aband`;
      case isCorrectAnswer:
        return `${CSS_PREPEND}correct`;
      default:
        return `${CSS_PREPEND}wrong`;
    }
  }

  getAriaLabel(isEmptyAnswer, isAnswerCorrect) {
    if (isEmptyAnswer) {
      return this.intl.t('pages.comparison-window.results.a11y.skipped-answer');
    }

    return isAnswerCorrect
      ? this.intl.t('pages.comparison-window.results.a11y.good-answer')
      : this.intl.t('pages.comparison-window.results.a11y.wrong-answer');
  }
}
