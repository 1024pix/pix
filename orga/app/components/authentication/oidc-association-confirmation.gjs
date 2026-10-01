import { PixButton, PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class OidcAssociationConfirmation extends Component {
  @service intl;
  @service authErrorMessages;
  @service router;

  @tracked errorMessage = null;
  @tracked isLoading = false;

  @action
  backToLoginForm() {
    this.router.transitionTo('authentication.oidc.login', this.args.identityProviderSlug);
  }

  @action
  async confirm() {
    this.isLoading = true;
    try {
      await this.args.onSubmit();
    } catch (responseError) {
      this.errorMessage = this.authErrorMessages.getAuthenticationErrorMessage(responseError);
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <h1 class="oidc-association__title">
      {{t "components.authentication.oidc-association-confirmation.title"}}
    </h1>

    <div class="oidc-association__container">

      <div class="oidc-association__user-information">
        <div class="oidc-association__user-fullname">
          <p>{{@fullNameFromPix}}</p>
        </div>

        <div class="oidc-association__user-authentication-methods">
          <p>{{t "components.authentication.oidc-association-confirmation.current-authentication-methods"}}</p>
          <dl class="oidc-association__user-authentication-methods-list">
            {{#if @email}}
              <dt>{{t "components.authentication.oidc-association-confirmation.email"}}</dt>
              <dd>{{@email}}</dd>
            {{/if}}
            {{#each @oidcAuthenticationMethodNames as |organizationName|}}
              <dt>{{t "components.authentication.oidc-association-confirmation.external-connection"}}</dt>
              <dd>{{organizationName}}</dd>
            {{/each}}
          </dl>

          <PixIcon @name="add" @ariaHidden={{true}} class="oidc-association__arrow" />

          <p>{{t "components.authentication.oidc-association-confirmation.authentication-method-to-add"}}</p>
          <dl class="oidc-association__user-authentication-methods-list">
            <dt>
              {{t "components.authentication.oidc-association-confirmation.external-connection-via"}}
              {{@identityProviderName}}
            </dt>
            <dd>{{@fullNameFromExternalIdentityProvider}}</dd>
          </dl>
        </div>
      </div>

      {{#if this.errorMessage}}
        <PixNotificationAlert @type="error" class="oidc-association__container-error">
          {{this.errorMessage}}
        </PixNotificationAlert>
      {{/if}}

      <div class="oidc-association__action-buttons">
        <PixButton @triggerAction={{this.confirm}} @isLoading={{this.isLoading}}>
          {{t "components.authentication.oidc-association-confirmation.confirm"}}
        </PixButton>
        <PixButton @triggerAction={{this.backToLoginForm}} @variant="secondary">
          {{t "components.authentication.oidc-association-confirmation.return"}}
        </PixButton>
      </div>
    </div>
  </template>
}
