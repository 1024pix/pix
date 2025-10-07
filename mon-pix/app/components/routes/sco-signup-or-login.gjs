import PixButton from '@1024pix/pix-ui/components/pix-button';
import { concat } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import LoginForm from 'mon-pix/components/routes/login-form';
import ScoSignupForm from 'mon-pix/components/routes/sco-signup-form';
<template>
  <div class="sco-signup-or-login">
    <div class="panel sco-signup-or-login__panel">
      <div>
        <img src="/images/pix-logo.svg" alt="Pix" class="sco-signup-or-login-panel__logo" />
      </div>
      <span class="sco-signup-or-login-panel__invitation">{{t
          "pages.sco-signup-or-login.invitation"
          organizationName=@organizationName
        }}</span>
      <div class="sco-signup-or-login-panel__forms-container">
        <div class="sco-signup-or-login-panel__form">
          <h1 class="form-title">{{t "pages.sco-signup-or-login.signup-form.title"}}</h1>
          {{#unless @displayScoSignupForm}}
            <PixButton id="register-button" @variant="secondary" @triggerAction={{@toggleFormsVisibility}}>
              {{t "pages.sco-signup-or-login.signup-form.button"}}
            </PixButton>
          {{/unless}}
          <div
            class={{concat
              "sco-signup-or-login-panel-form__expandable"
              (if @displayScoSignupForm " sco-signup-or-login-panel-form__expandable--expanded")
            }}
          >
            {{#if @displayScoSignupForm}}
              <ScoSignupForm @redirectionUrl={{@redirectionUrl}} @organizationId={{@organizationId}} />
            {{/if}}
          </div>
        </div>
        <div class="sco-signup-or-login-panel__divider"></div>
        <div class="sco-signup-or-login-panel__form">
          <h1 class="form-title">{{t "pages.sco-signup-or-login.login-form.title"}}</h1>
          {{#if @displayScoSignupForm}}
            <PixButton id="login-button" @variant="secondary" @triggerAction={{@toggleFormsVisibility}}>
              {{t "pages.sco-signup-or-login.login-form.button"}}
            </PixButton>
          {{/if}}
          <div
            class={{concat
              "sco-signup-or-login-panel-form__expandable"
              (unless @displayScoSignupForm " sco-signup-or-login-panel-form__expandable--expanded")
            }}
          >
            {{#unless @displayScoSignupForm}}
              <LoginForm @addGarAuthenticationMethodToUser={{@addGarAuthenticationMethodToUser}} />
            {{/unless}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
