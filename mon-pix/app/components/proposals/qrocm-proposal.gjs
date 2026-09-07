import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import eq from 'ember-truth-helpers/helpers/eq';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import getQrocInputSize from 'mon-pix/helpers/get-qroc-input-size';
import generateRandomString from 'mon-pix/utils/generate-random-string';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default class QrocmProposal extends Component {
  <template>
    <div class="qrocm-proposal">
      {{#each this.proposalBlocks as |block index|}}

        {{#if block.showText}}
          <MarkdownToHtml @markdown={{block.text}} @extensions="remove-paragraph-tags" class="qrocm-proposal__label" />
        {{/if}}
        {{#if (eq block.type "select")}}
          <div class="challenge-response__proposal challenge-response__proposal--selector">
            <PixSelect
              data-test="challenge-response-proposal-selector"
              @isDisabled={{@isAnswerFieldDisabled}}
              @screenReaderOnly={{true}}
              @texts={{hash placeholder=block.placeholder}}
              @value={{get @answersValue block.input}}
              @hideDefaultOption={{true}}
              @options={{block.options}}
              @onChange={{fn this.onChange block.input}}
              @size="large"
              @id="{{block.input}}"
            >
              <:label>{{block.ariaLabel}}</:label>
            </PixSelect>
          </div>
        {{else if (eq block.type "input")}}
          {{#if block.input}}
            <div class="qrocm-proposal__input">
              {{#if block.text}}
                <label for="{{block.input}}" data-test="qrocm-label-{{index}}">
                  <MarkdownToHtml @isInline={{true}} @extensions="remove-paragraph-tags" @markdown={{block.text}} />
                </label>
              {{/if}}

              {{#if (eq @format "paragraphe")}}
                <div class="challenge-response__proposal challenge-response__proposal--paragraph">
                  <PixTextarea
                    @id="{{block.input}}"
                    rows="5"
                    aria-label={{block.ariaLabel}}
                    placeholder={{block.placeholder}}
                    name={{block.randomName}}
                    @value={{get @answersValue block.input}}
                    data-test="challenge-response-proposal-selector"
                    disabled={{@isAnswerFieldDisabled}}
                    autocomplete="nope"
                    data-uid="qrocm-proposal-uid"
                    {{on "change" (fn this.onInputChange block.input)}}
                  />
                </div>
              {{else if (eq @format "phrase")}}
                <div class="challenge-response__proposal challenge-response__proposal--sentence">
                  <PixInput
                    @type="text"
                    @id="{{block.input}}"
                    name={{block.randomName}}
                    autocomplete="nope"
                    placeholder={{block.placeholder}}
                    @value={{get @answersValue block.input}}
                    disabled={{@isAnswerFieldDisabled}}
                    aria-label={{block.ariaLabel}}
                    data-test="challenge-response-proposal-selector"
                    data-uid="qrocm-proposal-uid"
                    {{on "change" (fn this.onInputChange block.input)}}
                  />
                </div>
              {{else}}
                <div class="challenge-response__proposal challenge-response__proposal--input">
                  <PixInput
                    @type="text"
                    @id="{{block.input}}"
                    name={{block.randomName}}
                    size="{{getQrocInputSize @format}}"
                    autocomplete="nope"
                    placeholder={{block.placeholder}}
                    @value={{get @answersValue block.input}}
                    disabled={{@isAnswerFieldDisabled}}
                    aria-label={{block.ariaLabel}}
                    data-test="challenge-response-proposal-selector"
                    data-uid="qrocm-proposal-uid"
                    {{on "change" (fn this.onInputChange block.input)}}
                  />
                </div>
              {{/if}}
            </div>
          {{/if}}
        {{/if}}
      {{/each}}
    </div>
  </template>
  @service intl;

  ARIA_LABEL_DELIMITATOR = '#';

  get proposalBlocks() {
    return proposalsAsBlocks(this.args.proposals).map((block) => {
      block.showText = block.text && !block.ariaLabel && !block.input;
      block.randomName = generateRandomString(block.input);
      if (block.ariaLabel) {
        if (block.autoAriaLabel) {
          block.ariaLabel = this.intl.t('pages.challenge.answer-input.numbered-label', { number: block.ariaLabel });
        }
        block.ariaLabel = this._formatAriaLabel(block.ariaLabel);
      }
      return block;
    });
  }

  _formatAriaLabel(rawAriaLabel) {
    return rawAriaLabel.split(this.ARIA_LABEL_DELIMITATOR)[0];
  }

  @action
  onInputChange(key, event) {
    this.args.answersValue[key] = event.target.value;
    this.args.answerChanged();
  }

  @action
  onChange(key, value) {
    this.args.answersValue[key] = value;
    this.args.onChangeSelect(this.args.answersValue);
  }
}
