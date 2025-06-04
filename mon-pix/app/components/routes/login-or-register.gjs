import PixButton from '@1024pix/pix-ui/components/pix-button';
import { concat } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import LoginForm from 'mon-pix/components/routes/login-form';
import RegisterForm from 'mon-pix/components/routes/register-form';
<template>
  <div class="login-or-register">
    <div class="panel login-or-register__panel">
      <div>
        <img src="/images/pix-logo.svg" alt="Pix" class="login-or-register-panel__logo" />
      </div>
      <span class="login-or-register-panel__invitation">{{t
          "pages.login-or-register.invitation"
          organizationName=@organizationName
        }}</span>
      <div class="login-or-register-panel__forms-container">
        <div class="login-or-register-panel__form">
          <h1 class="form-title">{{t "pages.login-or-register.register-form.title"}}</h1>
          {{#unless @displayRegisterForm}}
            <PixButton id="register-button" @variant="secondary" @triggerAction={{@toggleFormsVisibility}}>
              {{t "pages.login-or-register.register-form.button"}}
            </PixButton>
          {{/unless}}
          <div
            class={{concat
              "login-or-register-panel-form__expandable"
              (if @displayRegisterForm " login-or-register-panel-form__expandable--expanded")
            }}
          >
            {{#if @displayRegisterForm}}
              <RegisterForm @redirectionUrl={{@redirectionUrl}} @organizationId={{@organizationId}} />
            {{/if}}
          </div>
        </div>
        <div class="login-or-register-panel__divider"></div>
        <div class="login-or-register-panel__form">
          <h1 class="form-title">{{t "pages.login-or-register.login-form.title"}}</h1>
          {{#if @displayRegisterForm}}
            <PixButton id="login-button" @variant="secondary" @triggerAction={{@toggleFormsVisibility}}>
              {{t "pages.login-or-register.login-form.button"}}
            </PixButton>
          {{/if}}
          <div
            class={{concat
              "login-or-register-panel-form__expandable"
              (unless @displayRegisterForm " login-or-register-panel-form__expandable--expanded")
            }}
          >
            {{#unless @displayRegisterForm}}
              <LoginForm @addGarAuthenticationMethodToUser={{@addGarAuthenticationMethodToUser}} />
            {{/unless}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
