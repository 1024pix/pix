import { PixInput, PixTextarea } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import keys from 'lodash/keys';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import FormattedSolution from 'mon-pix/components/solution-panel/formatted-solution';
import getQrocInputSize from 'mon-pix/helpers/get-qroc-input-size';
import inc from 'mon-pix/helpers/inc';
import answersAsObject from 'mon-pix/utils/answers-as-object';
import labelsAsObject from 'mon-pix/utils/labels-as-object';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';
import resultDetailsAsObject from 'mon-pix/utils/result-details-as-object';
import solutionsAsObject from 'mon-pix/utils/solution-as-object';

export default class QrocmIndSolutionPanel extends Component {
  <template>
    <div class="qrocm-solution-panel qrocm-solution-panel--ind">
      <div class="rounded-panel__row correction-qrocm__text">
        {{#each this.blocks as |block|}}
          {{#if block.showText}}
            <MarkdownToHtml
              @markdown={{block.text}}
              @extensions="remove-paragraph-tags"
              class="correction-qrocm-text__label"
            />
          {{/if}}

          {{#if block.input}}
            {{#if block.text}}
              <label for="{{block.input}}">
                <MarkdownToHtml @isInline={{true}} @extensions="remove-paragraph-tags" @markdown={{block.text}} />
              </label>
            {{/if}}

            {{#if (eq @challenge.format "paragraphe")}}
              <div class="correction-qrocm__answer {{block.inputClass}}">
                <PixTextarea
                  class="correction-qrocm-answer__input-paragraph"
                  rows="5"
                  @value="{{block.answer}}"
                  @id="{{block.input}}"
                  aria-label={{block.ariaLabel}}
                  disabled
                />
              </div>
              {{#if block.emptyOrWrongAnswer}}
                <p class="correction-qrocm__solution">
                  <span class="sr-only">{{t "pages.comparison-window.results.a11y.the-answer-was"}}</span>
                  <FormattedSolution class="correction-qrocm__solution-text" @solutionToDisplay={{block.solution}} />
                </p>
              {{/if}}
            {{else if (eq @challenge.format "phrase")}}
              <div class="correction-qrocm__answer {{block.inputClass}}">
                <PixInput
                  class="correction-qrocm-answer__input-sentence"
                  @value="{{block.answer}}"
                  size="{{getQrocInputSize @challenge.format}}"
                  @id="{{block.input}}"
                  aria-label={{block.ariaLabel}}
                  disabled
                />
              </div>
              {{#if block.emptyOrWrongAnswer}}
                <p class="correction-qrocm__solution">
                  <span class="sr-only">{{t "pages.comparison-window.results.a11y.the-answer-was"}}</span>
                  <FormattedSolution class="correction-qrocm__solution-text" @solutionToDisplay={{block.solution}} />
                </p>
              {{/if}}
            {{else}}
              <div class="correction-qrocm__answer correction-qrocm__answer--input {{block.inputClass}}">
                {{#if block.answer.length}}
                  <PixInput
                    class="correction-qrocm-answer__input"
                    @value="{{block.answer}}"
                    size={{inc block.answer.length}}
                    @id="{{block.input}}"
                    aria-label={{block.ariaLabel}}
                    disabled
                  />
                {{/if}}
                {{#if block.emptyOrWrongAnswer}}
                  <p class="correction-qrocm__solution">
                    <span class="sr-only">{{t "pages.comparison-window.results.a11y.the-answer-was"}}</span>
                    <FormattedSolution class="correction-qrocm__solution-text" @solutionToDisplay={{block.solution}} />
                  </p>
                {{/if}}
              </div>
            {{/if}}
          {{/if}}

          {{#if block.breakline}}
            <br />
          {{/if}}

        {{/each}}
      </div>

      {{#if this.isNotCorrectlyAnswered}}
        {{#if @solutionToDisplay}}
          <div class="comparison-window-solution comparison-window-solution--with-margin">
            <span class="sr-only">{{t "pages.comparison-window.results.a11y.the-answer-was"}}</span>
            <FormattedSolution class="comparison-window-solution__text" @solutionToDisplay={{@solutionToDisplay}} />
          </div>
        {{/if}}
      {{/if}}

    </div>
  </template>
  @service intl;

  get isNotCorrectlyAnswered() {
    return this.args.answer.result !== 'ok';
  }

  get blocks() {
    if (!this.args.solution) {
      return undefined;
    }
    const escapedProposals = this.args.challenge.get('proposals').replace(/(\n\n|\n)/gm, '<br>');
    const labels = labelsAsObject(htmlSafe(escapedProposals).toString());
    const answers = answersAsObject(this.args.answer.value, keys(labels));
    const solutions = solutionsAsObject(this.args.solution);
    const resultDetails = resultDetailsAsObject(this.args.answer.resultDetails);

    return proposalsAsBlocks(this.args.challenge.get('proposals')).map((block) => {
      block.showText = block.text && !block.ariaLabel && !block.input;
      const blockIsInputOrTextarea = !block.showText && !block.breakline;

      if (blockIsInputOrTextarea) {
        const answerOutcome = this._computeAnswerOutcome(answers[block.input], resultDetails[block.input]);
        const inputClass = this._computeInputClass(answerOutcome);
        const ariaLabel = this._computeAriaLabel(answerOutcome);
        if (answers[block.input] == undefined || answers[block.input] === '') {
          answers[block.input] = this.intl.t('pages.result-item.aband');
        }
        block.ariaLabel = ariaLabel;
        block.inputClass = inputClass;
        block.answer = answers[block.input];
        block.solution = solutions[block.input][0];
        block.emptyOrWrongAnswer = answerOutcome === 'empty' || answerOutcome === 'ko';
      }
      return block;
    });
  }

  _computeAnswerOutcome(inputFieldValue, resultDetail) {
    if (inputFieldValue == undefined || inputFieldValue === '') {
      return 'empty';
    }
    return resultDetail === true ? 'ok' : 'ko';
  }

  _computeInputClass(answerOutcome) {
    if (answerOutcome === 'empty') {
      return 'correction-qroc-box-answer--aband';
    }
    if (answerOutcome === 'ok') {
      return 'correction-qroc-box-answer--correct';
    }
    return 'correction-qroc-box-answer--wrong';
  }

  _computeAriaLabel(answerOutcome) {
    switch (answerOutcome) {
      case 'ok':
        return this.intl.t('pages.comparison-window.results.a11y.good-answer');
      case 'ko':
        return this.intl.t('pages.comparison-window.results.a11y.wrong-answer');
      default:
        return this.intl.t('pages.comparison-window.results.a11y.skipped-answer');
    }
  }
}
