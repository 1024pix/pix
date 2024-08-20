import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class OrganizationsChildrenAttachChildFormComponent extends Component {
  @tracked childOrganization = '';

  @action
  childOrganizationInputValueChanged(event) {
    this.childOrganization = event.target.value;
  }

  @action
  submitForm(event) {
    event.preventDefault();
    this.args.onFormSubmitted(this.childOrganization);
    this.childOrganization = '';
  }

  <template>
    <form
      aria-label={{t "components.organizations.children.attach-child-form.name"}}
      class="organization__attach-child-form"
      {{on "submit" this.submitForm}}
    >
      <div class="organization__attach-child-form__content">
        <PixInput
          @id="child-organization"
          @subLabel={{t "components.organizations.children.attach-child-form.input-information"}}
          value={{this.childOrganization}}
          {{on "change" this.childOrganizationInputValueChanged}}
        >
          <:label>{{t "components.organizations.children.attach-child-form.input-label"}}</:label>
        </PixInput>
        <PixButton @size="small" @type="submit">{{t "common.actions.add"}}</PixButton>
      </div>
    </form>
  </template>
}
