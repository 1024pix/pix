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
      {{#if @controller.shouldShowEmailAndPasswordSection}}
        <section class="user-account-panel" aria-labelledby="email-and-password-title">
          <h2 class="user-account-panel__title" id="email-and-password-title">
            {{t "pages.user-account.connexion-methods.email-and-password-title"}}
          </h2>

          <dl class="user-account-panel__list">
            {{#if @controller.shouldShowEmail}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">
                  {{t "pages.user-account.connexion-methods.email"}}
                </dt>
                <dd class="user-account-panel-item__value" data-test-email>{{@model.user.email}}</dd>
                <dd class="user-account-panel-item__action">
                  <PixButton @variant="secondary" @size="small" @triggerAction={{@controller.enableEmailEditionMode}}>
                    {{t "pages.user-account.connexion-methods.edit-email-button"}}
                  </PixButton>
                </dd>
              </div>
            {{/if}}

            {{#if @controller.canAddEmailConnectionMethod}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">
                  {{t "pages.user-account.connexion-methods.email"}}
                </dt>
                <dd class="user-account-panel-item__value">
                  —
                </dd>
                <dd class="user-account-panel-item__action">
                  <PixButton @variant="secondary" @size="small" @triggerAction={{@controller.enableEmailEditionMode}}>
                    {{t "pages.user-account.account-add-or-update-email-with-validation.title.add-email"}}
                  </PixButton>
                </dd>
              </div>
            {{/if}}

            {{#if @controller.shouldShowUsername}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">
                  {{t "pages.user-account.connexion-methods.username"}}
                </dt>
                <dd class="user-account-panel-item__value" data-test-username>{{@model.user.username}}</dd>
              </div>
            {{/if}}

            {{#if @controller.shouldShowPixAuthenticationMethod}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">
                  {{t "pages.user-account.connexion-methods.password"}}
                </dt>
                <dd class="user-account-panel-item__value" aria-hidden="true">********</dd>
                <dd class="user-account-panel-item__action">
                  <PixButton
                    @variant="secondary"
                    @size="small"
                    @triggerAction={{@controller.enablePasswordEditionMode}}
                  >
                    {{t "pages.user-account.connexion-methods.edit-password-button"}}
                  </PixButton>
                </dd>
              </div>
            {{/if}}
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

      {{#if @controller.shouldShowOtherConnectionMethodsSection}}
        <section class="user-account-panel" aria-labelledby="other-connection-methods-title">
          <h2 class="user-account-panel__title" id="other-connection-methods-title">
            {{t "pages.user-account.connexion-methods.other-methods-title"}}
          </h2>

          <dl class="user-account-panel__list">
            {{#if @controller.shouldShowGarAuthenticationMethod}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">
                  {{t "pages.user-account.connexion-methods.authentication-methods.label"}}
                </dt>
                <dd class="user-account-panel-item__value">
                  {{t "pages.user-account.connexion-methods.authentication-methods.gar"}}
                </dd>
              </div>
            {{/if}}

            {{#each @controller.oidcAuthenticationMethodOrganizationNames as |organizationName|}}
              <div class="user-account-panel__item">
                <dt class="user-account-panel-item__label">
                  {{t "pages.user-account.connexion-methods.authentication-methods.other-authentication-label"}}
                </dt>
                <dd class="user-account-panel-item__value">
                  {{t
                    "pages.user-account.connexion-methods.authentication-methods.connection-via"
                    identityProviderOrganizationName=organizationName
                  }}
                </dd>
              </div>
            {{/each}}
          </dl>
        </section>
      {{/if}}
    {{/if}}
  </div>
</template>
