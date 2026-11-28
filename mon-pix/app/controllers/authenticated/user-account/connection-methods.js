import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const LABELS = 'pages.user-account.connexion-methods';
const ADD_EMAIL_LABEL = 'pages.user-account.account-add-or-update-email-with-validation.title.add-email';

export default class ConnectionMethodsController extends Controller {
  @service featureToggles;
  @service oidcIdentityProviders;

  @tracked isEmailEditionMode = false;
  @tracked isPasswordEditionMode = false;
  @tracked showEmailUpdatedMessage = false;
  @tracked showPasswordUpdatedMessage = false;

  get emailAndPasswordItems() {
    const { user } = this.model;

    const items = this.shouldShowPixAuthenticationMethod
      ? [
          user.email && {
            key: 'email',
            labelKey: `${LABELS}.email`,
            value: user.email,
            action: { labelKey: `${LABELS}.edit-email-button`, handler: this.enableEmailEditionMode },
          },
          user.username && {
            key: 'username',
            labelKey: `${LABELS}.username`,
            value: user.username,
          },
          {
            key: 'password',
            labelKey: `${LABELS}.password`,
            value: '********',
            isSecret: true,
            action: { labelKey: `${LABELS}.edit-password-button`, handler: this.enablePasswordEditionMode },
          },
        ].filter(Boolean)
      : [];

    if (this.canAddEmailConnectionMethod) {
      items.push({
        key: 'add-email',
        labelKey: `${LABELS}.email`,
        value: '—',
        action: { labelKey: ADD_EMAIL_LABEL, handler: this.enableEmailEditionMode },
      });
    }

    return items;
  }

  get otherAuthenticationMethodItems() {
    const items = [];

    if (this.model.authenticationMethods.some(({ identityProvider }) => identityProvider === 'GAR')) {
      items.push({
        key: 'gar',
        labelKey: `${LABELS}.authentication-methods.label`,
        valueKey: `${LABELS}.authentication-methods.gar`,
      });
    }

    this.oidcIdentityProviders
      .getIdentityProviderNamesByAuthenticationMethods(this.model.authenticationMethods)
      .forEach((organizationName, index) => {
        items.push({
          key: `oidc-${index}`,
          labelKey: `${LABELS}.authentication-methods.other-authentication-label`,
          valueKey: `${LABELS}.authentication-methods.connection-via`,
          valueParams: { identityProviderOrganizationName: organizationName },
        });
      });

    return items;
  }

  get shouldShowEmailConfirmedBanner() {
    return !!this.model.user.emailConfirmed;
  }

  get shouldShowPixAuthenticationMethod() {
    return this.model.authenticationMethods.some(({ identityProvider }) => identityProvider === 'PIX');
  }

  get canAddEmailConnectionMethod() {
    return this.model.accountInfo.canAddEmailConnectionMethod;
  }

  @action
  enableEmailEditionMode() {
    this.isEmailEditionMode = true;
  }

  @action
  disableEmailEditionMode() {
    this.isEmailEditionMode = false;
  }

  @action
  displayEmailUpdateMessage() {
    this.showEmailUpdatedMessage = true;
  }

  @action
  enablePasswordEditionMode() {
    this.isPasswordEditionMode = true;
  }

  @action
  disablePasswordEditionMode() {
    this.isPasswordEditionMode = false;
  }

  @action
  displayPasswordUpdatedMessage() {
    this.showPasswordUpdatedMessage = true;
  }
}
