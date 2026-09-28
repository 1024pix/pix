import { PixCheckbox } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import inc from 'mon-pix/helpers/inc';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

import { pshuffle } from '../../utils/pshuffle';

export default class QcmProposals extends Component {
  <template>
    <div class="qcm-proposals">
      {{#each this.labeledCheckboxes as |labeledCheckbox index|}}
        <p class="proposal-paragraph">
          <PixCheckbox
            name="{{inc index}}"
            disabled={{@isAnswerFieldDisabled}}
            checked={{labeledCheckbox.checked}}
            {{on "click" (fn this.checkboxClicked labeledCheckbox.value)}}
            data-test="challenge-response-proposal-selector"
          >
            <:label>
              <MarkdownToHtml
                @isInline={{true}}
                @extensions="remove-paragraph-tags"
                @markdown={{labeledCheckbox.label}}
              />
            </:label>
          </PixCheckbox>
        </p>
      {{/each}}
    </div>
  </template>
  get labeledCheckboxes() {
    const arrayOfProposals = proposalsAsArray(this.args.proposals);
    const arrayOfBoolean = valueAsArrayOfBoolean(this.args.answerValue);
    const labeledCheckboxesList = labeledCheckboxes(arrayOfProposals, arrayOfBoolean);
    if (this.args.shuffled) {
      pshuffle(labeledCheckboxesList, this.args.shuffleSeed);
    }
    return labeledCheckboxesList;
  }

  @action
  checkboxClicked(checkboxName) {
    this.args.answerChanged(checkboxName);
  }
}
