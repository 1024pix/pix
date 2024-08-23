import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import noop from 'lodash/noop';

import ConfirmPopup from '../confirm-popup';

export default class JuryComment extends Component {
  @service accessControl;

  @tracked editingMode = false;
  @tracked commentBeingEdited;
  @tracked shouldDisplayDeletionConfirmationModal = false;

  constructor() {
    super(...arguments);
  }

  get comment() {
    return this.args.comment;
  }

  @action
  async submitForm(event) {
    event.preventDefault();
    try {
      await this.args.onFormSubmit(this.commentBeingEdited);
      this.exitEditingMode();
    } catch {
      noop();
    }
  }

  @action
  enterEditingMode() {
    this.editingMode = true;
    this.commentBeingEdited = this.comment;
  }

  @action
  exitEditingMode() {
    this.editingMode = false;
    this.commentBeingEdited = '';
  }

  @action
  openDeletionConfirmationModal() {
    this.shouldDisplayDeletionConfirmationModal = true;
  }

  @action
  closeDeletionConfirmationModal() {
    this.shouldDisplayDeletionConfirmationModal = false;
  }

  @action
  async confirmDeletion() {
    try {
      this.closeDeletionConfirmationModal();
      await this.args.onDeleteButtonClicked();
    } catch {
      noop();
    }
  }

  @action
  updateCommentBeingEdited(event) {
    this.commentBeingEdited = event.target.value;
  }

  get commentExists() {
    return this.comment !== null;
  }

  get shouldDisplayForm() {
    return this.editingMode || !this.commentExists;
  }

  <template>
    <section class="page-section session-jury-comment">
      <h2 class="jury-comment__title">Commentaire de l'équipe Certification</h2>
      {{#if this.shouldDisplayForm}}
        {{#if this.accessControl.hasAccessToCertificationActionsScope}}
          <form onsubmit={{this.submitForm}}>
            <PixTextarea
              @screenReaderOnly={{true}}
              placeholder="Ajouter un commentaire…"
              @value={{this.commentBeingEdited}}
              {{on "change" this.updateCommentBeingEdited}}
              class="jury-comment__field"
              @id="jury-comment-field"
              required={{true}}
            >
              <:label>Texte du commentaire</:label>
            </PixTextarea>
            <div class="jury-comment__actions">
              {{#if this.commentExists}}
                <PixButton @triggerAction={{this.exitEditingMode}} @variant="secondary" @size="small">
                  {{t "common.actions.cancel"}}
                </PixButton>
              {{/if}}
              <PixButton @type="submit" @size="small">
                {{t "common.actions.save"}}
              </PixButton>
            </div>
          </form>
        {{/if}}
      {{else}}
        <div>
          <span class="jury-comment__author">{{@author}}</span>
          -
          <time class="jury-comment__date">{{dayjsFormat @date "DD/MM/YYYY à HH:mm"}}</time>
        </div>
        <p class="jury-comment__content">{{this.comment}}</p>
        {{#if this.accessControl.hasAccessToCertificationActionsScope}}
          <div class="jury-comment__actions">
            <PixButton @triggerAction={{this.enterEditingMode}} @size="small">
              {{t "common.actions.edit"}}
            </PixButton>
            <PixButton @triggerAction={{this.openDeletionConfirmationModal}} @size="small" @variant="secondary">
              Supprimer
            </PixButton>
          </div>
        {{/if}}
      {{/if}}
    </section>

    <ConfirmPopup
      @title="Suppression du commentaire"
      @message="Voulez-vous vraiment supprimer le commentaire de {{@author}} ?"
      @confirm={{this.confirmDeletion}}
      @cancel={{this.closeDeletionConfirmationModal}}
      @show={{this.shouldDisplayDeletionConfirmationModal}}
    />
  </template>
}
