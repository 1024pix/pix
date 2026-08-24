import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import uniq from 'lodash/uniq';

export default class AttachOrganizationsForm extends Component {
  @tracked organizationsToAttach = '';
  @service pixToast;

  get isDisabledAttachOrganizations() {
    return this.organizationsToAttach === '';
  }

  _getUniqueOrganizations() {
    const organizationIds = this.organizationsToAttach.split(',').map((organizationId) => parseInt(organizationId));
    return uniq(organizationIds);
  }

  @action
  onOrganizationsToAttachChange(event) {
    this.organizationsToAttach = event.target.value;
  }

  @action
  async attachOrganizations(e) {
    e.preventDefault();
    if (this.isDisabledAttachOrganizations) return;

    const organizationsToAttach = this._getUniqueOrganizations();
    const { attachedIds, duplicatedIds } = await this.args.attachOrganizations(organizationsToAttach);

    this.organizationsToAttach = '';
    const hasInsertedOrganizations = attachedIds.length > 0;
    const hasDuplicatedOrganizations = duplicatedIds.length > 0;
    const message = [];

    if (hasInsertedOrganizations) {
      message.push('Organisation(s) rattaché(es) avec succès.');
    }

    if (hasInsertedOrganizations && hasDuplicatedOrganizations) {
      message.push('<br />');
    }

    if (hasDuplicatedOrganizations) {
      message.push(
        `Le(s) organisation(s) suivantes étai(en)t déjà rattachée(s) à ce profil cible : ${duplicatedIds.join(', ')}`,
      );
    }

    await this.pixToast.sendSuccessNotification({ message: htmlSafe(message.join('')) });

    return this.args.reloadAfterSuccess();
  }

  <template>
    <form class="organization__form" {{on "submit" this.attachOrganizations}}>
      <label for="attach-organizations">Rattacher une ou plusieurs organisation(s)</label>
      <div class="organization__sub-form">
        <PixInput
          id="attach-organizations"
          @value={{this.organizationsToAttach}}
          class="form-field__text form-control"
          placeholder="1, 2"
          aria-describedby="attach-organizations-info"
          {{on "input" this.onOrganizationsToAttachChange}}
        />
        <p id="attach-organizations-info" hidden>Ids des organisations, séparés par une virgule</p>
        <PixButton
          @type="submit"
          @size="small"
          aria-label="Valider le rattachement"
          @isDisabled={{this.isDisabledAttachOrganizations}}
        >
          {{t "common.actions.validate"}}
        </PixButton>
      </div>
    </form>
  </template>
}
