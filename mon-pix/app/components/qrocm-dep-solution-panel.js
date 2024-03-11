import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import jsyaml from 'js-yaml';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

const SKIPPED_FLAG = '#ABAND#';
const CHALLENGE_OK_FLAG = 'ok';

export default class QrocmDepSolutionPanel extends Component {
  @service intl;

  get blocks() {
    const answersEvaluations = this.args.answersEvaluation ? [...this.args.answersEvaluation] : null;
    const expectedAnswers = [...this.expectedAnswers];

    return proposalsAsBlocks(this.args.challenge.get('proposals')).map((block) => {
      if (!block.input || !answersEvaluations) {
        return block;
      }
      const answerEvaluation = answersEvaluations.shift();
      block.answer = this.isSkipped ? this.intl.t('pages.result-item.aband') : this.answersAsObject[block.input];
      block.inputClass = this.getInputClass(this.isSkipped, answerEvaluation);
      block.ariaLabel = this.getAriaLabel(this.isSkipped, answerEvaluation);
      if (this.shouldDisplayAnswersUnderInputs && !answerEvaluation) {
        block.solution = expectedAnswers.shift();
      }
      return block;
    });
  }

  get isCorrectAnswer() {
    return this.args.answer.result === CHALLENGE_OK_FLAG;
  }

  get formattedSolution() {
    if (this.args.solutionToDisplay) {
      return this.args.solutionToDisplay;
    }
    if (this.shouldDisplayAnswersUnderInputs) {
      return null;
    }
    const expectedAnswers = this.expectedAnswers;
    const formattedExpectedAnswers = expectedAnswers.join(
      ` ${this.intl.t('pages.comparison-window.results.solutions.or')} `,
    );
    return `${formattedExpectedAnswers} ${this.intl.t('pages.comparison-window.results.solutions.end')}`;
  }

  get isSkipped() {
    return this.args.answer.value === SKIPPED_FLAG;
  }

  get isIncorrectOrSkipped() {
    return this.isSkipped || !this.isCorrectAnswer;
  }

  get answersAsObject() {
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).toString());
    return answersAsObject(this.args.answer.value, Object.keys(labels));
  }

  get solutions() {
    return jsyaml.safeLoad(this.args.solution);
  }

  get inputCount() {
    return Object.keys(this.answersAsObject).length;
  }

  get solutionsCount() {
    return Object.keys(this.solutions).length;
  }

  get expectedAnswers() {
    if (!this.args.solutionsWithoutGoodAnswers) return [];
    return this.args.solutionsWithoutGoodAnswers.length
      ? this.args.solutionsWithoutGoodAnswers.slice(0, this.inputCount)
      : this.extractSolutionsFromSolutionObject(this.solutions, this.inputCount);
  }

  get shouldDisplayAnswersUnderInputs() {
    return this.isIncorrectOrSkipped && this.solutionsCount === this.inputCount;
  }

  extractSolutionsFromSolutionObject(solutions, sliceEndIndex) {
    return Object.values(solutions)
      .slice(0, sliceEndIndex)
      .map((solutionVariants) => solutionVariants[0]);
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

  getAriaLabel(isEmptyAnswer, isCorrectAnswer) {
    switch (true) {
      case isEmptyAnswer:
        return this.intl.t('pages.comparison-window.results.a11y.skipped-answer');
      case isCorrectAnswer:
        return this.intl.t('pages.comparison-window.results.a11y.good-answer');
      default:
        return this.intl.t('pages.comparison-window.results.a11y.wrong-answer');
    }
  }
}
