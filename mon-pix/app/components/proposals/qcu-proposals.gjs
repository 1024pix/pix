import { PixRadioButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import { pshuffle } from 'mon-pix/utils/pshuffle';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

export default class QcuProposals extends Component {
  <template>
    {{! template-lint-disable builtin-component-arguments }}
    {{#each this.labeledRadios as |labeledRadio|}}
      <p class="proposal-paragraph qcu-proposals">
        <PixRadioButton
          name="radio"
          @value={{labeledRadio.value}}
          disabled={{@isAnswerFieldDisabled}}
          checked={{labeledRadio.checked}}
          {{on "click" (fn this.radioClicked labeledRadio.value)}}
          data-value="{{labeledRadio.value}}"
          class="qcu-proposals__radio"
          data-test="challenge-response-proposal-selector"
        >
          <:label>
            <MarkdownToHtml @isInline={{true}} @extensions="remove-paragraph-tags" @markdown={{labeledRadio.label}} />
          </:label>
        </PixRadioButton>
      </p>
    {{/each}}
  </template>
  get labeledRadios() {
    const arrayOfProposals = proposalsAsArray(this.args.proposals);
    const labeledCheckboxesList = labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean(this.args.answerValue));
    if (this.args.shuffled) {
      pshuffle(labeledCheckboxesList, this.args.shuffleSeed);
    }
    return labeledCheckboxesList;
  }

  @action
  radioClicked() {
    this.args.answerChanged();
  }
}
