import { PixRadioButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import labeledCheckboxes from 'junior/utils/labeled-checkboxes';
import proposalsAsArray from 'junior/utils/proposals-as-array';
import { pshuffle } from 'junior/utils/pshuffle';
import valueAsArrayOfBoolean from 'junior/utils/value-as-array-of-boolean';

import MarkdownToHtml from '../../markdown-to-html';

export default class Qcu extends Component {
  get labeledRadios() {
    const arrayOfProposals = proposalsAsArray(this.args.challenge.proposals);
    const labeledCheckboxesList = labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean());
    if (this.args.challenge.shuffled) {
      pshuffle(labeledCheckboxesList, this.args.assessment?.id);
    }
    return labeledCheckboxesList;
  }

  @action
  radioClicked() {
    const checkedInputValues = [];
    const radioInputElements = document.querySelectorAll('input[type="radio"]');
    Array.prototype.forEach.call(radioInputElements, function (element) {
      if (element.checked) {
        checkedInputValues.push(element.getAttribute('data-value'));
        element.parentNode.classList.add('pix-label--checked');
      } else {
        element.parentNode.classList.remove('pix-label--checked');
      }
    });
    this.args.setAnswerValue(checkedInputValues.join(''));
  }
  <template>
    <div class="challenge-content-proposals__qcu-radios">
      <p class="challenge-content-proposals__qcu-radios__hint">{{t "pages.challenge.qcu-hint"}}</p>
      {{#each this.labeledRadios as |labeledRadio|}}
        <PixRadioButton
          name="radio"
          @value={{labeledRadio.value}}
          disabled={{@isDisabled}}
          checked={{labeledRadio.checked}}
          {{on "click" (fn this.radioClicked labeledRadio.value)}}
          data-value="{{labeledRadio.value}}"
          @class="pix1d-radio {{if @isDisabled 'pix1d-radio--disabled'}}"
          data-test="challenge-response-proposal-selector"
        >
          <:label>
            <MarkdownToHtml @class="qcu-panel__text proposal-text" @markdown={{labeledRadio.label}} />
          </:label>
        </PixRadioButton>
      {{/each}}
    </div>
  </template>
}
