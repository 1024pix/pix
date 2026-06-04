import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class OrganizationNetworkAttachChildFormComponent extends Component {
  @service intl;
  @service pixToast;

  @tracked childOrganizationIds = '';

  @action
  childOrganizationInputValueChanged(event) {
    this.childOrganizationIds = event.target.value;
  }

  @action
  submitForm(event) {
    event.preventDefault();
    const hasInvalidId = this.childOrganizationIds.split(',').some((id) => !/^\d+$/.test(id.trim()));
    if (hasInvalidId) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.organizations.network.attach-child-form.invalid-ids-error'),
      });
      return;
    }
    this.args.onFormSubmitted(this.childOrganizationIds);
    this.childOrganizationIds = '';
  }

  <template>
    <form
      aria-label={{t "components.organizations.network.attach-child-form.name"}}
      class="organization__attach-child-form"
      {{on "submit" this.submitForm}}
    >
      <div class="organization__attach-child-form__content">
        <PixInput
          @id="child-organizations"
          @subLabel={{t "components.organizations.network.attach-child-form.input-information"}}
          value={{this.childOrganizationIds}}
          {{on "change" this.childOrganizationInputValueChanged}}
        >
          <:label>{{t "components.organizations.network.attach-child-form.input-label"}}</:label>
        </PixInput>
        <PixButton @size="small" @type="submit">{{t "common.actions.add"}}</PixButton>
      </div>
    </form>
  </template>
}
