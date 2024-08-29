import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import focus from '../../../modifiers/focus';

export default class CertificationIssueReportModal extends Component {
  @tracked label = null;
  @tracked errorMessage = null;

  @action
  resolve() {
    if (this._isInvalid()) {
      this.errorMessage = 'Le motif de résolution doit être renseigné.';
      return;
    }

    this.errorMessage = null;
    this.args.resolveIssueReport(this.args.issueReport, this.label);
    this.args.closeResolveModal();
  }

  @action
  onChangeLabel(event) {
    this.label = event.target.value;
  }

  get actionName() {
    return this.args.issueReport.isResolved ? 'Modifier la résolution' : 'Résoudre ce signalement';
  }

  _isInvalid() {
    return this.args.issueReport.isResolved && !this.label?.trim();
  }

  <template>
    <PixModal @title="{{this.actionName}}" @onCloseButtonClick={{@toggleResolveModal}} @showModal={{@displayModal}}>
      <:content>
        <PixTextarea
          @id="resolve-reason"
          @value={{@issueReport.resolution}}
          type="text"
          maxLength="255"
          @errorMessage={{this.errorMessage}}
          {{on "change" this.onChangeLabel}}
          {{focus}}
        >
          <:label>Résolution</:label>
        </PixTextarea>
      </:content>

      <:footer>
        <PixButton
          @type="submit"
          @size="small"
          class="pix-button--background-transparent-light"
          {{on "click" @toggleResolveModal}}
        >
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @size="small" @triggerAction={{this.resolve}}>{{this.actionName}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
