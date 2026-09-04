import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';

import didRender from '../../../modifiers/did-render';
import generateRandomString from '../../../utils/generate-random-string';
import proposalsAsBlocks from '../../../utils/proposals-as-blocks';
import MarkdownToHtml from '../../markdown-to-html';

export default class Qrocm extends Component {
  @tracked answerValues;

  @action
  resetAnswerValues() {
    this.answerValues = this.#extractProposals();
  }

  #extractProposals() {
    const proposals = proposalsAsBlocks(this.args.challenge.proposals);
    const inputFieldsNames = {};

    proposals.forEach(({ input }) => {
      if (input) {
        inputFieldsNames[input] = '';
      }
    });
    return inputFieldsNames;
  }

  get proposalBlocks() {
    const proposals = proposalsAsBlocks(this.args.challenge.proposals).map((block) => {
      block.showText = block.text && !block.ariaLabel && !block.input;
      block.randomName = generateRandomString(block.input);
      block.ariaLabel = block.autoAriaLabel ? `Réponse {${block.ariaLabel}}` : block.ariaLabel;
      return block;
    });
    return proposals;
  }

  @action
  onInputChange(key, event) {
    this.answerValues[key] = event.target.value;
    this.#synchronizeAnswers();
  }

  @action
  onSelectChange(key, value) {
    // Tracked property answersValue has to be reassigned to be considered as changed
    const newAnswersValue = this.answerValues;
    newAnswersValue[key] = value;
    this.answerValues = newAnswersValue;
    this.#synchronizeAnswers();
  }

  #synchronizeAnswers() {
    if (!this.#allFieldsAnswered) {
      this.args.setAnswerValue('');
      return;
    }
    if (this.#hasUniqueAnswer) {
      this.args.setAnswerValue(this.#uniqueAnswer);
    } else {
      this.args.setAnswerValue(JSON.stringify(this.answerValues));
    }
  }

  get #hasUniqueAnswer() {
    return Object.keys(this.answerValues).length === 1;
  }

  get #allFieldsAnswered() {
    return !Object.values(this.answerValues).includes('');
  }

  get #uniqueAnswer() {
    return Object.values(this.answerValues)[0];
  }

  <template>
    <div {{didRender this.resetAnswerValues}} class="challenge-content-proposals">
      {{#each this.proposalBlocks as |block|}}
        {{#if block.showText}}
          <MarkdownToHtml @markdown={{block.text}} @extensions="remove-paragraph-tags" class="qrocm-proposal__label" />
        {{/if}}
        {{#if (eq block.type "select")}}
          <PixSelect
            class="challenge-content-proposals__response"
            @value={{get this.answerValues block.input}}
            @screenReaderOnly={{true}}
            @text={{hash placeholder=block.placeholder}}
            @hideDefaultOption={{true}}
            @options={{block.options}}
            @onChange={{fn this.onSelectChange block.input}}
            @id="{{block.input}}"
            @isDisabled={{@isDisabled}}
            @isComputeWidthDisabled={{true}}
          >
            <:label>{{block.ariaLabel}}</:label>
          </PixSelect>
        {{else if (eq block.type "input")}}
          {{#if block.input}}
            <div class="qrocm-proposal__input">
              {{#if block.text}}
                <label for="{{block.input}}">
                  <MarkdownToHtml
                    @markdown={{block.text}}
                    @extensions="remove-paragraph-tags"
                    class="challenge-content-proposals__input-label"
                  />
                </label>
              {{/if}}

              {{#if (eq @challenge.format "paragraphe")}}
                <PixTextarea
                  @id="{{block.input}}"
                  class="challenge-content-proposals__response challenge-content-proposals__response--paragraph"
                  rows="5"
                  aria-label={{block.ariaLabel}}
                  placeholder={{block.placeholder}}
                  name={{block.randomName}}
                  autocomplete="nope"
                  disabled={{@isDisabled}}
                  {{! To activate validation button as soon as possible }}
                  {{on "keyup" (fn this.onInputChange block.input)}}
                  {{! To also deal with browser dictionary auto complete }}
                  {{on "change" (fn this.onInputChange block.input)}}
                />
              {{else if (eq @challenge.format "phrase")}}
                <PixInput
                  class="challenge-content-proposals__response"
                  @type="text"
                  @id="{{block.input}}"
                  name={{block.randomName}}
                  @isFullWidth={{true}}
                  autocomplete="nope"
                  placeholder={{block.placeholder}}
                  aria-label={{block.ariaLabel}}
                  disabled={{@isDisabled}}
                  {{! To activate validation button as soon as possible }}
                  {{on "keyup" (fn this.onInputChange block.input)}}
                  {{! To also deal with browser dictionary auto complete }}
                  {{on "change" (fn this.onInputChange block.input)}}
                />
              {{else if (eq @challenge.format "nombre")}}
                <PixInput
                  @id="{{block.input}}"
                  class="challenge-content-proposals__response challenge-content-proposals__response--number"
                  name={{block.randomName}}
                  type="number"
                  min="0"
                  placeholder={{block.placeholder}}
                  @value={{get @answerValues block.input}}
                  aria-label={{block.ariaLabel}}
                  disabled={{@isDisabled}}
                  {{! To activate validation button as soon as possible }}
                  {{on "keyup" (fn this.onInputChange block.input)}}
                  {{! To also deal with browser dictionary auto complete }}
                  {{on "change" (fn this.onInputChange block.input)}}
                />
              {{else}}
                <PixInput
                  @type="text"
                  class="challenge-content-proposals__response challenge-content-proposals__response--short-text"
                  @id="{{block.input}}"
                  name={{block.randomName}}
                  autocomplete="nope"
                  placeholder={{block.placeholder}}
                  @value={{get @answerValues block.input}}
                  aria-label={{block.ariaLabel}}
                  disabled={{@isDisabled}}
                  {{! To activate validation button as soon as possible }}
                  {{on "keyup" (fn this.onInputChange block.input)}}
                  {{! To also deal with browser dictionary auto complete }}
                  {{on "change" (fn this.onInputChange block.input)}}
                />
              {{/if}}
            </div>
          {{/if}}
        {{/if}}
      {{/each}}
    </div>
  </template>
}
