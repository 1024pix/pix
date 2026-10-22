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
  @service intl;

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
    await this.pixToast.sendSuccessNotification({
      message: this.intl.t('components.combined-course-blueprints.organizations.detach-organizations.message.success'),
    });
    return this.args.reloadAfterSuccess();
  }

  <template>
    <form class="organization__form" {{on "submit" this.detachOrganizations}}>
      <label for="detach-organizations">
        {{t "components.combined-course-blueprints.organizations.detach-organizations.label"}}
      </label>
      <div class="organization__sub-form">
        <PixInput
          id="detach-organizations"
          @value={{this.organizationsToDetach}}
          class="form-field__text form-control"
          placeholder="1, 2"
          aria-describedby="detach-organizations-info"
          {{on "input" this.onOrganizationsToDetachChange}}
        />
        <p id="detach-organizations-info" hidden>
          {{t "components.combined-course-blueprints.organizations.detach-organizations.info"}}
        </p>
        <PixButton
          @type="submit"
          @size="small"
          aria-label={{t "components.combined-course-blueprints.organizations.detach-organizations.confirm"}}
          @isDisabled={{this.isDisabledDetachOrganizations}}
        >
          {{t "common.actions.validate"}}
        </PixButton>
      </div>
    </form>
  </template>
}
