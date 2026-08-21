import { PixButton, PixModal, PixTextarea } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import focus from '../../../../../modifiers/focus';

export default class CertificationIssueReportModal extends Component {
  @service pixToast;

  @tracked resolution = null;
  @tracked errorMessage = null;

  @action
  async onSubmit() {
    if (this._isInvalid()) {
      this.errorMessage = 'Le motif de résolution doit être renseigné.';
      return;
    }

    this.errorMessage = null;

    try {
      await this.args.issueReport.save({ adapterOptions: { resolutionLabel: this.resolution } });
      await this.args.certification.reload();

      this.pixToast.sendSuccessNotification({ message: 'Le signalement a été résolu.' });
    } catch (error) {
      this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue :\n' + error?.errors[0]?.detail });
    } finally {
      this.args.toggleResolveModal();
    }
  }

  @action
  onResolutionChange(event) {
    this.resolution = event.target.value;
  }

  get actionName() {
    return this.args.issueReport.isResolved ? 'Modifier la résolution' : 'Résoudre ce signalement';
  }

  _isInvalid() {
    return this.args.issueReport.isResolved && !this.resolution?.trim();
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
          {{on "change" this.onResolutionChange}}
          {{focus}}
        >
          <:label>Résolution</:label>
        </PixTextarea>
      </:content>

      <:footer>
        <PixButton
          @variant="secondary"
          class="pix-button--background-transparent-light"
          @triggerAction={{@toggleResolveModal}}
        >
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{this.onSubmit}}>{{this.actionName}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
