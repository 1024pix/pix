import { PixButton, PixNotificationAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';

import AddOrUpdateEmailWithValidation from '../../../components/user-account/add-or-update-email-with-validation';
import UpdatePasswordForm from '../../../components/user-account/update-password-form';

<template>
  <div class="user-account__connection-methods">
    {{#if @controller.isEmailEditionMode}}
      <AddOrUpdateEmailWithValidation
        @disableEmailEditionMode={{@controller.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{@controller.displayEmailUpdateMessage}}
        @canAddEmailConnectionMethod={{@controller.canAddEmailConnectionMethod}}
      />
    {{else if @controller.isPasswordEditionMode}}
      <UpdatePasswordForm
        @disablePasswordEditionMode={{@controller.disablePasswordEditionMode}}
        @displayPasswordUpdatedMessage={{@controller.displayPasswordUpdatedMessage}}
      />
    {{else}}
      {{#if @controller.emailAndPasswordItems.length}}
        <section class="user-account-panel" aria-labelledby="email-and-password-title">
          <h2 class="user-account-panel__title" id="email-and-password-title">
            {{t "pages.user-account.connexion-methods.email-and-password-title"}}
          </h2>

          <dl class="user-account-panel__list">
            {{#each @controller.emailAndPasswordItems as |item|}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">{{t item.labelKey}}</dt>
                <dd class="user-account-panel-item__value" aria-hidden={{if item.isSecret "true"}}>
                  {{item.value}}
                </dd>
                {{#if item.action}}
                  <dd class="user-account-panel-item__action">
                    <PixButton @variant="secondary" @size="small" @triggerAction={{item.action.handler}}>
                      {{t item.action.labelKey}}
                    </PixButton>
                  </dd>
                {{/if}}
              </div>
            {{/each}}
          </dl>

          {{#if @controller.showEmailUpdatedMessage}}
            <PixNotificationAlert @type="success" @withIcon={{true}} class="user-account-panel__success-message">
              {{t "pages.user-account.email-verification.update-successful"}}
            </PixNotificationAlert>
          {{/if}}

          {{#if @controller.shouldShowEmailConfirmedBanner}}
            <PixNotificationAlert @type="success" @withIcon={{true}} class="user-account-panel__success-message">
              {{t "pages.user-account.email-confirmed"}}
            </PixNotificationAlert>
          {{/if}}

          {{#if @controller.showPasswordUpdatedMessage}}
            <PixNotificationAlert @type="success" @withIcon={{true}} class="user-account-panel__success-message">
              {{t "pages.user-account.update-password.update-successful"}}
            </PixNotificationAlert>
          {{/if}}
        </section>
      {{/if}}

      {{#if @controller.otherAuthenticationMethodItems.length}}
        <section class="user-account-panel" aria-labelledby="other-connection-methods-title">
          <h2 class="user-account-panel__title" id="other-connection-methods-title">
            {{t "pages.user-account.connexion-methods.other-methods-title"}}
          </h2>

          <dl class="user-account-panel__list">
            {{#each @controller.otherAuthenticationMethodItems as |item|}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">{{t item.labelKey}}</dt>
                <dd class="user-account-panel-item__value">
                  {{t item.valueKey identityProviderOrganizationName=item.valueParams.identityProviderOrganizationName}}
                </dd>
              </div>
            {{/each}}
          </dl>
        </section>
      {{/if}}
    {{/if}}
  </div>
</template>
