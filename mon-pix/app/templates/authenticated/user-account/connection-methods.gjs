import { PixButton, PixNotificationAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';

import AddOrUpdateEmailWithValidation from '../../../components/user-account/add-or-update-email-with-validation';

<template>
  <div class="user-account__connection-methods">
    {{#if @controller.isEmailEditionMode}}
      <AddOrUpdateEmailWithValidation
        @disableEmailEditionMode={{@controller.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{@controller.displayEmailUpdateMessage}}
        @canAddEmailConnectionMethod={{@controller.canAddEmailConnectionMethod}}
      />
    {{else}}
      {{#if @controller.shouldShowPixAuthenticationMethod}}
        {{#if @controller.shouldShowEmail}}
          <div class="user-account-panel__item{{if @controller.showEmailUpdatedMessage ' with-success-message'}}">
            <div class="user-account-panel-item__text">
              <p class="form-textfield__label user-account-panel-item__label">
                {{t "pages.user-account.connexion-methods.email"}}
              </p>
              <p class="user-account-panel-item__value" data-test-email>{{@model.user.email}}</p>
            </div>
            <div>
              <PixButton
                class="user-account-panel-item__button"
                @triggerAction={{@controller.enableEmailEditionMode}}
                @size="small"
              >
                {{t "pages.user-account.connexion-methods.edit-button"}}
              </PixButton>
            </div>
          </div>

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
        {{/if}}

        {{#if @controller.shouldShowUsername}}
          <div class="user-account-panel__item">
            <div class="user-account-panel-item__text">
              <p class="form-textfield__label user-account-panel-item__label">
                {{t "pages.user-account.connexion-methods.username"}}
              </p>
              <p class="user-account-panel-item__value" data-test-username>{{@model.user.username}}</p>
            </div>
          </div>
        {{/if}}
      {{/if}}

      {{#if @controller.shouldShowGarAuthenticationMethod}}
        <div class="user-account-panel__item">
          <div class="user-account-panel-item__text">
            <p class="form-textfield__label user-account-panel-item__label">{{t
                "pages.user-account.connexion-methods.authentication-methods.label"
              }}</p>
            <p class="user-account-panel-item__value">
              {{t "pages.user-account.connexion-methods.authentication-methods.gar"}}
            </p>
          </div>
        </div>
      {{/if}}

      {{#if @controller.canAddEmailConnectionMethod}}
        <div class="user-account-panel__item">
          <div class="user-account-panel-item__text">
            <p class="form-textfield__label user-account-panel-item__label">{{t
                "pages.user-account.connexion-methods.email"
              }}</p>
            <p class="user-account-panel-item__value">
              —
            </p>
          </div>
          <PixButton
            class="user-account-panel-item__add-email-button"
            @size="small"
            @triggerAction={{@controller.enableEmailEditionMode}}
          >
            {{t "pages.user-account.account-add-or-update-email-with-validation.title.add-email"}}
          </PixButton>
        </div>
      {{/if}}

      {{#each @controller.oidcAuthenticationMethodOrganizationNames as |organizationName|}}
        <div class="user-account-panel__item">
          <div class="user-account-panel-item__text">
            <p class="form-textfield__label user-account-panel-item__label">
              {{t "pages.user-account.connexion-methods.authentication-methods.other-authentication-label"}}
            </p>
            <p class="user-account-panel-item__value">
              {{t
                "pages.user-account.connexion-methods.authentication-methods.connection-via"
                identityProviderOrganizationName=organizationName
              }}
            </p>
          </div>
        </div>
      {{/each}}

    {{/if}}
  </div>
</template>
