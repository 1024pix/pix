import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class JoinRequestForm extends Component {
  @service session;
  @service store;

  @tracked uai;
  @tracked firstName = '';
  @tracked lastName = '';
  @tracked firstNameValidationMessage = null;
  @tracked lastNameValidationMessage = null;
  @tracked uaiValidationMessage = null;

  @tracked isLoading = false;

  validation = {
    firstName: 'Votre prénom n’est pas renseigné.',
    lastName: 'Votre nom n’est pas renseigné.',
    uai: "L'UAI/RNE n'est pas renseigné.",
  };

  @action
  validateFirstName(event) {
    this.firstNameValidationMessage = null;
    this.firstName = event.target.value?.trim() ?? '';
    const isInvalidInput = this.firstName === '';

    if (isInvalidInput) {
      this.firstNameValidationMessage = this.validation.firstName;
    }
  }

  @action
  validateLastName(event) {
    this.lastNameValidationMessage = null;
    this.lastName = event.target.value?.trim() ?? '';
    const isInvalidInput = this.lastName === '';

    if (isInvalidInput) {
      this.lastNameValidationMessage = this.validation.lastName;
    }
  }

  @action
  validateUai(event) {
    this.uaiValidationMessage = null;
    this.uai = event.target.value?.trim() ?? '';
    const isInvalidInput = this.uai === '';

    if (isInvalidInput) {
      this.uaiValidationMessage = this.validation.uai;
    }
  }

  @action
  async submit(event) {
    event.preventDefault();
    this.isLoading = true;
    const scoOrganizationInvitation = {
      uai: this.uai.trim(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    };
    await this.args.onSubmit(scoOrganizationInvitation);
    this.isLoading = false;
  }

  <template>
    <div class="join-request-form">

      <form {{on "submit" this.submit}}>
        <p class="join-request-form__information">Tous les champs sont obligatoires.</p>

        <div class="input-container">
          <PixInput
            @id="uai"
            name="uai"
            type="text"
            {{on "change" this.validateUai}}
            @errorMessage={{this.uaiValidationMessage}}
            @validationStatus={{if this.uaiValidationMessage "error" "default"}}
            required={{true}}
            aria-required={{true}}
            autocomplete="off"
          >
            <:label>{{t "pages.join-request-form.organization-code"}}</:label>

          </PixInput>
        </div>

        <div class="input-container">
          <PixInput
            @id="firstName"
            name="firstName"
            type="firstName"
            {{on "change" this.validateFirstName}}
            @errorMessage={{this.firstNameValidationMessage}}
            @validationStatus={{if this.firstNameValidationMessage "error" "default"}}
            required={{true}}
            aria-required={{true}}
            autocomplete="given-name"
          >
            <:label>{{t "pages.join-request-form.firstname"}}</:label>
          </PixInput>
        </div>

        <div class="input-container">
          <PixInput
            @id="lastName"
            name="lastName"
            type="lastName"
            {{on "change" this.validateLastName}}
            @errorMessage={{this.lastNameValidationMessage}}
            @validationStatus={{if this.lastNameValidationMessage "error" "default"}}
            required={{true}}
            aria-required={{true}}
            autocomplete="family-name"
          >
            <:label>{{t "pages.join-request-form.lastname"}}</:label>
          </PixInput>
        </div>

        <div class="input-container">
          <PixButton @type="submit" @isLoading={{this.isLoading}}>
            {{t "common.actions.confirm"}}
          </PixButton>
        </div>

      </form>

      <p class="join-request-form__legal-information">
        {{t "pages.join-request-form.legal-information.text"}}
        <a href={{t "pages.join-request-form.legal-information.link-url"}} target="_blank" rel="noopener noreferrer">
          {{t "pages.join-request-form.legal-information.link-text"}}
        </a>
      </p>
    </div>
  </template>
}
