import { PixCheckbox } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import labeledCheckboxes from 'junior/utils/labeled-checkboxes';
import proposalsAsArray from 'junior/utils/proposals-as-array';
import { pshuffle } from 'junior/utils/pshuffle';
import valueAsArrayOfBoolean from 'junior/utils/value-as-array-of-boolean';

import MarkdownToHtml from '../../markdown-to-html';

export default class Qcm extends Component {
  @service intl;
  checkedValues = new Set();

  get labeledCheckboxes() {
    const arrayOfProposals = proposalsAsArray(this.args.challenge.proposals);
    const arrayOfBoolean = valueAsArrayOfBoolean();
    const labeledCheckboxesList = labeledCheckboxes(arrayOfProposals, arrayOfBoolean);
    if (this.args.challenge.shuffled) {
      pshuffle(labeledCheckboxesList, this.args.assessment?.id);
    }
    this.checkedValues.clear();
    return labeledCheckboxesList;
  }

  @action
  checkboxClicked(checkboxName) {
    if (this.checkedValues.has(checkboxName)) {
      this.checkedValues.delete(checkboxName);
      document.getElementsByName(checkboxName)[0].parentNode.classList.remove('pix-label--checked');
    } else {
      this.checkedValues.add(checkboxName);
      document.getElementsByName(checkboxName)[0].parentNode.classList.add('pix-label--checked');
    }
    this.args.setAnswerValue(Array.from(this.checkedValues).join());
    this._checkValidations();
  }

  _checkValidations() {
    if (this._hasLessThanTwoValues()) {
      this.args.setValidationWarning(this.intl.t('pages.challenge.qcm-error'));
    } else {
      this.args.setValidationWarning(null);
    }
  }

  _hasLessThanTwoValues() {
    return Array.from(this.checkedValues).length < 2;
  }

  <template>
    <div class="challenge-content-proposals__qcm-checkboxes">
      <p class="challenge-content-proposals__qcm-checkboxes__hint">{{t "pages.challenge.qcm-hint"}}</p>
      {{#each this.labeledCheckboxes as |labeledCheckbox|}}
        <PixCheckbox
          name="{{labeledCheckbox.value}}"
          @class="pix1d-checkbox {{if @isDisabled 'pix1d-checkbox--disabled'}}"
          disabled={{@isDisabled}}
          checked={{labeledCheckbox.checked}}
          {{on "click" (fn this.checkboxClicked labeledCheckbox.value)}}
          data-test="challenge-response-proposal-selector"
        >
          <:label>
            <MarkdownToHtml @class="proposal-text" @markdown={{labeledCheckbox.label}} />
          </:label>
        </PixCheckbox>
      {{/each}}
    </div>
  </template>
}
