import Model, { attr } from '@ember-data/model';
import { buildValidations, validator } from 'ember-cp-validations';

const Validations = buildValidations({
  externalId: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: "La longueur de l'identifiant externe ne doit pas excéder 255 caractères",
      }),
    ],
  },
  provinceCode: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur du département ne doit pas excéder 255 caractères',
      }),
    ],
  },
  dataProtectionOfficerFirstName: {
    validators: [
      validator('length', {
        max: 255,
        message: 'La longueur du prénom ne doit pas excéder 255 caractères.',
      }),
    ],
  },
  dataProtectionOfficerLastName: {
    validators: [
      validator('length', {
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères.',
      }),
    ],
  },
  dataProtectionOfficerEmail: {
    validators: [
      validator('length', {
        max: 255,
        message: "La longueur de l'email ne doit pas excéder 255 caractères.",
      }),
      validator('format', {
        allowBlank: true,
        type: 'email',
        message: "L'e-mail n'a pas le bon format.",
      }),
    ],
  },
  email: {
    validators: [
      validator('length', {
        max: 255,
        message: "La longueur de l'email ne doit pas excéder 255 caractères.",
      }),
      validator('format', {
        allowBlank: true,
        type: 'email',
        message: "L'e-mail n'a pas le bon format.",
      }),
    ],
  },
  credit: {
    validators: [
      validator('number', {
        allowString: true,
        integer: true,
        positive: true,
        allowBlank: true,
        message: 'Le nombre de crédits doit être un nombre supérieur ou égal à 0.',
      }),
    ],
  },
  documentationUrl: {
    validators: [
      validator('absolute-or-relative-url', {
        allowBlank: true,
        message: "Le lien n'est pas valide.",
      }),
    ],
  },
  administrationTeamId: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'components.organizations.editing.administration-team.selector.error-message',
      }),
    ],
  },
  countryCode: {
    validators: [
      validator('presence', {
        presence: true,
        message: 'components.organizations.editing.country.selector.error-message',
      }),
    ],
  },
});

export default class OrganizationForm extends Model.extend(Validations) {
  @attr('string') name;
  @attr('string') externalId;
  @attr('string') provinceCode;
  @attr('string') dataProtectionOfficerFirstName;
  @attr('string') dataProtectionOfficerLastName;
  @attr('string') dataProtectionOfficerEmail;
  @attr('string') email;
  @attr('number') credit;
  @attr('string') documentationUrl;
  @attr() identityProviderForCampaigns;
  @attr('string') administrationTeamId;
  @attr('string') countryCode;

  #getErrorAttribute(name) {
    const nameAttribute = this.validations.attrs.get(name);
    if (nameAttribute.isInvalid) {
      return {
        message: nameAttribute.message,
        status: 'error',
      };
    }
    return { message: null, status: null };
  }

  get creditError() {
    return this.#getErrorAttribute('credit');
  }

  get dataProtectionOfficerEmailError() {
    return this.#getErrorAttribute('dataProtectionOfficerEmail');
  }

  get dataProtectionOfficerFirstNameError() {
    return this.#getErrorAttribute('dataProtectionOfficerFirstName');
  }

  get dataProtectionOfficerLastNameError() {
    return this.#getErrorAttribute('dataProtectionOfficerLastName');
  }

  get documentationUrlError() {
    return this.#getErrorAttribute('documentationUrl');
  }

  get emailError() {
    return this.#getErrorAttribute('email');
  }

  get externalIdError() {
    return this.#getErrorAttribute('externalId');
  }

  get provinceCodeError() {
    return this.#getErrorAttribute('provinceCode');
  }

  get administrationTeamIdError() {
    return this.#getErrorAttribute('administrationTeamId');
  }

  get countryCodeError() {
    return this.#getErrorAttribute('countryCode');
  }
}
