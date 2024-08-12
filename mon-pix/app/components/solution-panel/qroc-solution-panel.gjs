import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

const classByResultValue = {
  ok: 'correction-qroc-box-answer--correct',
  ko: 'correction-qroc-box-answer--wrong',
  aband: 'correction-qroc-box-answer--aband',
  timeout: 'correction-qroc-box-answer--timeout',
};

export default class QrocSolutionPanel extends Component {
  @service intl;

  get inputClass() {
    if (this.args.answer.timeout === -1) {
      return classByResultValue.timeout;
    }

    return classByResultValue[this.args.answer.result] || '';
  }

  get isNotCorrectlyAnswered() {
    return this.args.answer.result !== 'ok';
  }

  get inputAriaLabel() {
    if (this.args.answer.timeout === -1) {
      return this.intl.t('pages.comparison-window.results.a11y.timedout');
    }

    switch (this.args.answer.result) {
      case 'ok':
        return this.intl.t('pages.comparison-window.results.a11y.good-answer');
      case 'ko':
        return this.intl.t('pages.comparison-window.results.a11y.wrong-answer');
      default:
        return this.intl.t('pages.comparison-window.results.a11y.skipped-answer');
    }
  }

  get hasCorrection() {
    return this.args.solution || this.args.solutionToDisplay;
  }

  get answerToDisplay() {
    if (this.args.answer.timeout === -1) {
      return this.intl.t('pages.result-item.timedout');
    }

    const answer = this.args.answer.value;
    if (answer === '#ABAND#') {
      return this.intl.t('pages.result-item.aband');
    }

    return answer;
  }

  get understandableSolution() {
    if (this.args.solutionToDisplay) {
      return this.args.solutionToDisplay;
    }
    const solutionVariants = this.args.solution;
    if (!solutionVariants) {
      return '';
    }
    return solutionVariants.split('\n')[0];
  }

  <template>
    {{#if this.hasCorrection}}
      <div class="rounded-panel rounded-panel__row correction-qroc-box">
        {{#if @solution}}
          <div class="correction-qroc-box__answer">
            {{#if (eq @answer.challenge.format "paragraphe")}}
              <div class="correction-qroc-box-answer {{this.inputClass}}">
                <PixTextarea
                  class="correction-qroc-box-answer--paragraph"
                  @id="correction-qroc-box-answer__paragraphe"
                  rows="5"
                  @value={{this.answerToDisplay}}
                  aria-label={{this.inputAriaLabel}}
                  disabled
                />
              </div>
            {{else if (eq @answer.challenge.format "phrase")}}
              <div class="correction-qroc-box-answer {{this.inputClass}}">
                <PixInput
                  class="correction-qroc-box-answer--sentence"
                  @id="correction-qroc-box-answer--sentence"
                  @value="{{this.answerToDisplay}}"
                  @ariaLabel={{this.inputAriaLabel}}
                  disabled
                />
              </div>
            {{else}}
              <div class="correction-qroc-box-answer {{this.inputClass}}">
                <PixInput
                  class="correction-qroc-box-answer--input"
                  @id="correction-qroc-box-answer"
                  size="{{this.answerToDisplay.length}}"
                  @value="{{this.answerToDisplay}}"
                  @ariaLabel={{this.inputAriaLabel}}
                  disabled
                />
              </div>
            {{/if}}
          </div>
        {{/if}}
        {{#if this.isNotCorrectlyAnswered}}
          {{#if this.understandableSolution}}
            <p class="comparison-window-solution">
              <span class="sr-only">{{t "pages.comparison-window.results.a11y.the-answer-was"}}</span>
              <span class="comparison-window-solution__text">{{this.understandableSolution}}</span>
            </p>
          {{/if}}
        {{/if}}
      </div>
    {{/if}}
  </template>
}
