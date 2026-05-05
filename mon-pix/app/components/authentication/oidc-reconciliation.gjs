import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class OidcReconciliationComponent extends Component {
  <template>
    <h1 class="oidc-reconciliation__title">
      {{t "pages.oidc-reconciliation.title"}}
      <span class="oidc-reconciliation__subtitle">{{t "pages.oidc-reconciliation.sub-title"}}</span>
    </h1>
    <p class="oidc-reconciliation__information">{{t "pages.oidc-reconciliation.information"}}</p>
    <div class="oidc-reconciliation__container">
      <div class="oidc-reconciliation__user-information">
        <PixIcon @name="userCircle" @plainIcon={{true}} @ariaHidden={{true}} />
        <p>{{@fullNameFromPix}}</p>
        <div class="oidc-reconciliation__user-authentication-methods">
          <p>{{t "pages.oidc-reconciliation.current-authentication-methods"}}</p>
          <dl
            class="oidc-reconciliation__user-authentication-methods-list"
            title={{t "pages.oidc-reconciliation.current-authentication-methods"}}
          >
            {{#if this.shouldShowEmail}}
              <div>
                <dt>{{t "pages.oidc-reconciliation.email"}}</dt>
                <dd>{{@email}}</dd>
              </div>
            {{/if}}
            {{#if this.shouldShowUsername}}
              <div>
                <dt>{{t "pages.oidc-reconciliation.username"}}</dt>
                <dd>{{@username}}</dd>
              </div>
            {{/if}}
            {{#if this.shouldShowGarAuthenticationMethod}}
              <div>
                <dt>{{t "pages.oidc-reconciliation.external-connection"}}</dt>
                <dd>{{t "pages.user-account.connexion-methods.authentication-methods.gar"}}</dd>
              </div>
            {{/if}}
            {{#each this.oidcAuthenticationMethodOrganizationNames as |organizationName|}}
              <div>
                <dt>{{t "pages.oidc-reconciliation.external-connection"}}</dt>
                <dd>{{organizationName}}</dd>
              </div>
            {{/each}}
          </dl>
        </div>
      </div>

      <div class="oidc-reconciliation__switch-account-button">
        <PixButton @triggerAction={{this.backToLoginOrRegisterForm}} @variant="secondary">{{t
            "pages.oidc-reconciliation.switch-account"
          }}</PixButton>
      </div>

      <PixIcon @name="arrowTop" @ariaHidden={{true}} class="oidc-reconciliation__arrow" />
      <div class="oidc-reconciliation__new-authentication-method">
        <p>{{t "pages.oidc-reconciliation.authentication-method-to-add"}}</p>
        <PixBlock class="oidc-reconciliation__authentication-method-to-add">
          <dl title={{t "pages.oidc-reconciliation.authentication-method-to-add"}}>
            <dt>{{t "pages.oidc-reconciliation.external-connection-via"}} {{this.identityProviderOrganizationName}}</dt>
            <dd>{{@fullNameFromExternalIdentityProvider}}</dd>
          </dl>
        </PixBlock>
      </div>

      {{#if this.reconcileErrorMessage}}
        <PixNotificationAlert @type="error" class="oidc-reconciliation__container-error">
          {{this.reconcileErrorMessage}}
        </PixNotificationAlert>
      {{/if}}

      <div class="oidc-reconciliation__action-buttons">
        <PixButton @triggerAction={{this.backToLoginOrRegisterForm}} @variant="secondary">{{t
            "pages.oidc-reconciliation.return"
          }}</PixButton>
        <PixButton @triggerAction={{this.reconcile}} @isLoading={{this.isLoading}}>
          {{t "pages.oidc-reconciliation.confirm"}}
        </PixButton>
      </div>
    </div>
  </template>
  @service intl;
  @service oidcIdentityProviders;
  @service session;
  @service errorMessages;

  @tracked reconcileErrorMessage = null;
  @tracked isLoading = false;

  get identityProviderOrganizationName() {
    return this.oidcIdentityProviders.findBySlug(this.args.identityProviderSlug)?.organizationName;
  }

  get shouldShowEmail() {
    return !!this.args.email;
  }

  get shouldShowUsername() {
    return !!this.args.username;
  }

  get shouldShowGarAuthenticationMethod() {
    return this.args.authenticationMethods.some(
      (authenticationMethod) => authenticationMethod.identityProvider === 'GAR',
    );
  }

  get oidcAuthenticationMethodOrganizationNames() {
    return this.oidcIdentityProviders.getIdentityProviderNamesByAuthenticationMethods(this.args.authenticationMethods);
  }

  @action
  backToLoginOrRegisterForm() {
    this.args.toggleOidcReconciliation();
  }

  @action
  async reconcile() {
    this.isLoading = true;

    try {
      await this.session.authenticate('authenticator:oidc', {
        authenticationKey: this.args.authenticationKey,
        identityProviderSlug: this.args.identityProviderSlug,
        hostSlug: 'user/reconcile',
      });
    } catch (responseError) {
      this.reconcileErrorMessage = this.errorMessages.getAuthenticationErrorMessage(responseError);
    } finally {
      this.isLoading = false;
    }
  }
}
