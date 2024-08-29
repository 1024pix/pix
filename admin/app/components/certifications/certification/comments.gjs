import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import pick from 'ember-composable-helpers/helpers/pick';
import { t } from 'ember-intl';
import set from 'ember-set-helper/helpers/set';

import CertificationInfoField from '../info-field';

export default class Comments extends Component {
  @tracked isEditingJuryComment = false;
  @tracked commentByJury;

  @action
  editJuryComment() {
    this.isEditingJuryComment = true;
  }

  @action
  async saveJuryComment() {
    const hasBeenSaved = await this.args.onJuryCommentSave(this.commentByJury);
    if (hasBeenSaved) {
      this.cancelJuryCommentEdition();
    }
  }

  @action
  cancelJuryCommentEdition() {
    this.isEditingJuryComment = false;
  }

  <template>
    <div class="certification-informations__row">
      <div class="certification-informations__card">
        <h2 class="certification-informations__card__title">Commentaires jury</h2>
        <CertificationInfoField
          @value={{@certification.commentForCandidate}}
          @edition={{false}}
          @label="Pour le candidat :"
          @fieldId="certification-commentForCandidate"
        />
        <CertificationInfoField
          @value={{@certification.commentForOrganization}}
          @edition={{false}}
          @label="Pour l'organisation :"
          @fieldId="certification-commentForOrganization"
        />
        <div class="certification-info-field">
          {{#if this.isEditingJuryComment}}
            <label for="certification-commentByJury" class="certification-info-field__label">
              Notes internes Jury Pix :
            </label>
            <PixTextarea
              id="certification-commentByJury"
              @value={{@certification.commentByJury}}
              class="form-control"
              {{on "input" (pick "target.value" (set this "commentByJury"))}}
            />
          {{else}}
            <p>Notes internes Jury Pix :</p>
            <p>
              {{if @certification.commentByJury @certification.commentByJury " - "}}
            </p>
          {{/if}}
        </div>
        <CertificationInfoField @value={{@certification.juryId}} @edition={{false}} @label="Identifiant jury :" />

        {{#if this.isEditingJuryComment}}
          <ul class="certification-information-comments">
            <li>
              <PixButton @size="small" @variant="secondary" @triggerAction={{this.cancelJuryCommentEdition}}>
                {{t "common.actions.cancel"}}
              </PixButton>
            </li>
            <li>
              <PixButton @size="small" @triggerAction={{this.saveJuryComment}}>
                {{t "common.actions.save"}}
              </PixButton>
            </li>
          </ul>
        {{else}}
          <PixButton @size="small" @triggerAction={{this.editJuryComment}}>
            Modifier le commentaire jury
          </PixButton>
        {{/if}}
      </div>
    </div>
  </template>
}
