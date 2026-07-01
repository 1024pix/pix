import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class AttachCertificationCenterForm extends Component {
  @tracked certificationCenterId;

  onCertificationCenterIdToAttachChange = (event) => {
    this.certificationCenterId = event.target.value;
  };

  submitForm = (event) => {
    event.preventDefault();
    this.args.onFormSubmitted(this.certificationCenterId);
  };

  <template>
    <form
      aria-label={{t "components.organizations.attached-certification-center.attach-form.name"}}
      class="attach-certification-center-form"
      {{on "submit" this.submitForm}}
    >
      <PixInput
        type="number"
        @id="attached-certification-center"
        @subLabel={{t "components.organizations.attached-certification-center.attach-form.input-sublabel"}}
        @value={{this.certificationCenterId}}
        @requiredLabel={{t "common.fields.required-field"}}
        {{on "change" this.onCertificationCenterIdToAttachChange}}
      >
        <:label>{{t "components.organizations.attached-certification-center.attach-form.input-label"}}</:label>
      </PixInput>
      <PixButton @size="small" @type="submit">{{t "common.actions.validate"}}</PixButton>
    </form>
  </template>
}
