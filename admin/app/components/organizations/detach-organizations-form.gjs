import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import uniq from 'lodash/uniq';

export default class DetachOrganizationsForm extends Component {
  @tracked organizationsToDetach = '';
  @service pixToast;

  get isDisabledDetachOrganizations() {
    return this.organizationsToDetach === '';
  }

  _getUniqueOrganizations() {
    const organizationIds = this.organizationsToDetach.split(',').map((organizationId) => parseInt(organizationId));
    return uniq(organizationIds);
  }

  @action
  onOrganizationsToDetachChange(event) {
    this.organizationsToDetach = event.target.value;
  }

  @action
  async detachOrganizations(e) {
    e.preventDefault();
    if (this.isDisabledDetachOrganizations) return;

    const organizationsToDetach = this._getUniqueOrganizations();
    const organizationsHaveBeenDetached = await this.args.detachOrganizations(organizationsToDetach);
    if (!organizationsHaveBeenDetached) {
      return;
    }

    this.organizationsToDetach = '';
    await this.pixToast.sendSuccessNotification({ message: 'Organisation(s) détachée(s) avec succès.' });
    return this.args.reloadAfterSuccess();
  }

  <template>
    <form class="organization__form" {{on "submit" this.detachOrganizations}}>
      <label for="detach-organizations">Détacher une ou plusieurs organisation(s)</label>
      <div class="organization__sub-form">
        <PixInput
          id="detach-organizations"
          @value={{this.organizationsToDetach}}
          class="form-field__text form-control"
          placeholder="1, 2"
          aria-describedby="detach-organizations-info"
          {{on "input" this.onOrganizationsToDetachChange}}
        />
        <p id="detach-organizations-info" hidden>Ids des organisations, séparés par une virgule</p>
        <PixButton
          @type="submit"
          @size="small"
          aria-label="Valider le détachement"
          @isDisabled={{this.isDisabledDetachOrganizations}}
        >
          {{t "common.actions.validate"}}
        </PixButton>
      </div>
    </form>
  </template>
}
