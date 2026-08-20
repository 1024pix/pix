import PixButton from '@1024pix/pix-ui/components/pix-button';
import { concat } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import RegisterForm from 'pix-certif/components/auth/register-form';
import ToggableLoginForm from 'pix-certif/components/auth/toggable-login-form';
import LocaleSwitcher from 'pix-certif/components/locale-switcher';

export default class LoginOrRegister extends Component {
  @service currentDomain;

  @tracked displayRegisterForm = true;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  @action
  toggleFormsVisibility() {
    this.displayRegisterForm = !this.displayRegisterForm;
  }

  <template>
    <div class='login-or-register'>
      <div class='panel login-or-register__panel'>
        <img src='/pix-certif-logo.svg' alt='Pix Certif' class='login-or-register-panel__logo' />
        <span class='login-or-register-panel__invitation'>{{t
            'pages.login-or-register.title'
            certificationCenterName=@certificationCenterName
          }}</span>
        <div class='login-or-register-panel__forms-container'>
          <div class='login-or-register-panel__form'>
            <h1 class='login-or-register-panel-form__title page-title'>{{t
                'pages.login-or-register.register-form.title'
              }}</h1>
            {{#unless this.displayRegisterForm}}
              <PixButton
                id='register'
                @triggerAction={{this.toggleFormsVisibility}}
                @variant='secondary'
                @isBorderVisible={{true}}
              >
                {{t 'pages.login-or-register.register-form.actions.login'}}
              </PixButton>
            {{/unless}}
            <div
              class={{concat
                'login-or-register-panel-form__expandable'
                (if this.displayRegisterForm ' login-or-register-panel-form__expandable--expanded')
              }}
            >
              {{#if this.displayRegisterForm}}
                <RegisterForm
                  @certificationCenterInvitationId={{@certificationCenterInvitationId}}
                  @certificationCenterInvitationCode={{@certificationCenterInvitationCode}}
                />
              {{/if}}
            </div>
          </div>
          <div class='login-or-register-panel__divider'></div>
          <div class='login-or-register-panel__form'>
            <h1 class='login-or-register-panel-form__title page-title'>{{t
                'pages.login-or-register.login-form.title'
              }}</h1>
            {{#if this.displayRegisterForm}}
              <PixButton
                id='login'
                @triggerAction={{this.toggleFormsVisibility}}
                @variant='secondary'
                @isBorderVisible={{true}}
              >
                {{t 'pages.login-or-register.login-form.button'}}
              </PixButton>
            {{/if}}
            <div
              class={{concat
                'login-or-register-panel-form__expandable'
                (unless this.displayRegisterForm ' login-or-register-panel-form__expandable--expanded')
              }}
            >
              {{#unless this.displayRegisterForm}}
                <ToggableLoginForm
                  @isWithInvitation={{true}}
                  @certificationCenterInvitationId={{@certificationCenterInvitationId}}
                  @certificationCenterInvitationCode={{@certificationCenterInvitationCode}}
                />
              {{/unless}}
            </div>
          </div>
        </div>
      </div>
      {{#if this.isInternationalDomain}}
        <div class='login-or-register__language-switcher'>
          <LocaleSwitcher />
        </div>
      {{/if}}
    </div>
  </template>
}
