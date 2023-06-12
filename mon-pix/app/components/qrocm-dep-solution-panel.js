import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import keys from 'lodash/keys';
import { inject as service } from '@ember/service';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';
import jsyaml from 'js-yaml';

export default class QrocmDepSolutionPanel extends Component {
  @service intl;

  get blocks() {
    const answersEvaluations = this.args.answersEvaluation ? [...this.args.answersEvaluation] : null;

    return proposalsAsBlocks(this.args.challenge.get('proposals')).map((block) => {
      if (!block.input || !answersEvaluations) {
        return block;
      }
      const answerEvaluation = answersEvaluations.shift();
      const isAnswerEmpty = this.answersAsObject[block.input] === '';
      block.answer = isAnswerEmpty ? this.intl.t('pages.result-item.aband') : this.answersAsObject[block.input];
      block.inputClass = this.getInputClass(isAnswerEmpty, answerEvaluation);
      block.ariaLabel = this.getAriaLabel(isAnswerEmpty, answerEvaluation);
      return block;
    });
  }

  get answersAsObject() {
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).string);
    return answersAsObject(this.args.answer.value, keys(labels));
  }

  get answerIsCorrect() {
    return this.args.answer.result === 'ok';
  }

  get solutions() {
    return jsyaml.safeLoad(this.args.solution);
  }

  get inputCount() {
    return Object.keys(this.answersAsObject).length;
  }

  get expectedAnswers() {
    if (!this.args.solutionsWithoutGoodAnswers) return [];
    return this.args.solutionsWithoutGoodAnswers.length
      ? this.args.solutionsWithoutGoodAnswers.slice(0, this.inputCount)
      : Object.keys(this.solutions)
          .slice(0, this.inputCount)
          .map((key) => this.solutions[key][0]);
  }

  get understandableSolution() {
    if (this.args.solutionToDisplay) {
      return this.args.solutionToDisplay;
    }
    if (!this.args.solutionsWithoutGoodAnswers) {
      return '';
    }
    return this.intl.t('pages.comparison-window.results.otherSolutions', {
      expectedAnswers: this.expectedAnswers.join(', '),
    });
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
