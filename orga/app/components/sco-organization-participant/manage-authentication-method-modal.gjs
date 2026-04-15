import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import CopyPasteButton from '../copy-paste-button';

export default class ManageAuthenticationMethodModal extends Component {
  @service store;
  @service pixToast;
  @service intl;

  @tracked isUniquePasswordVisible = false;

  @tracked generatedPassword = null;

  defaultErrorMessage = this._t('error.default');

  @action
  async resetPassword(event) {
    event.preventDefault();
    const dependentUser = this.store.createRecord('dependent-user', {
      organizationId: this.args.organizationId,
      organizationLearnerId: this.args.student.id,
    });

    try {
      await dependentUser.save();
      this.generatedPassword = dependentUser.generatedPassword;
      this.isUniquePasswordVisible = !this.isUniquePasswordVisible;
    } catch {
      this.pixToast.sendErrorNotification({ message: this._t('error.unexpected') });
    }
  }

  @action
  async generateUsernameWithTemporaryPassword(event) {
    event.preventDefault();
    const dependentUser = this.store.createRecord('dependent-user', {
      organizationId: this.args.organizationId,
      organizationLearnerId: this.args.student.id,
    });

    try {
      await dependentUser.save({ adapterOptions: { generateUsernameAndTemporaryPassword: true } });
      this.args.student.username = dependentUser.username;

      if (!this.args.student.email) {
        this.generatedPassword = dependentUser.generatedPassword;
        this.isUniquePasswordVisible = !this.isUniquePasswordVisible;
      }
    } catch (response) {
      const errorDetail = response?.errors[0]?.detail ?? this.defaultErrorMessage;
      this.pixToast.sendErrorNotification({ message: errorDetail });
    }
  }

  @action
  async unblockOrganizationLearnerAccount(event) {
    event.preventDefault();

    try {
      await this.store.adapterFor('sco-organization-participant').unblockOrganizationLearner({
        organizationId: this.args.organizationId,
        organizationLearnerId: this.args.student.id,
      });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'pages.sco-organization-participants.manage-authentication-method-modal.section.unblock.success-notification',
        ),
      });
      await this.args.refreshValues();
    } catch (fetchErrors) {
      const error = Array.isArray(fetchErrors) && fetchErrors.length > 0 && fetchErrors[0];
      let errorMessage;
      switch (error?.code) {
        case 'USER_DOES_NOT_BELONG_TO_ORGANIZATION':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.user-does-not-belong-to-organization-error',
          );
          break;
        case 'ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.organization-learner-does-not-belong-to-organization-error',
          );
          break;
        default:
          errorMessage = this.intl.t(this._getI18nKeyByStatus(error.status));
      }
      this.pixToast.sendErrorNotification({ message: errorMessage });
    }
  }

  @action
  closeModal() {
    this.isUniquePasswordVisible = false;
    this.args.onClose();
  }

  _t(key) {
    return this.intl.t(`pages.sco-organization-participants.manage-authentication-method-modal.${key}`);
  }

  <template>
    <PixModal
      @title="{{t 'pages.sco-organization-participants.manage-authentication-method-modal.title'}}"
      @showModal={{@display}}
      @onCloseButtonClick={{this.closeModal}}
    >
      <:content>
        <form class="manage-authentication-window">
          <h2 class="manage-authentication-window__title">
            <PixIcon @name="link" />
            {{t "pages.sco-organization-participants.manage-authentication-method-modal.authentication-methods"}}
          </h2>

          <div>
            {{#if @student.isAuthenticatedFromGar}}
              <div class="manage-authentication-window__box">
                <div class="manage-authentication-window__subTitle manage-authentication-window__subTitle--mediacentre">
                  <span>
                    {{t
                      "pages.sco-organization-participants.manage-authentication-method-modal.section.mediacentre.label"
                    }}
                  </span>
                  <PixIcon @name="checkCircle" class="green-icon" />
                </div>
              </div>
            {{/if}}

            {{#if @student.hasEmail}}
              <div class="manage-authentication-window__box">
                <div class="manage-authentication-window__subTitle">
                  <h3>
                    {{t "pages.sco-organization-participants.manage-authentication-method-modal.section.email.label"}}
                  </h3>
                  <PixIcon @name="checkCircle" class="green-icon" />
                </div>
                <div class="input-container">
                  <div class="manage-authentication-window__clipboard">
                    <PixInput
                      @id="email"
                      name="email"
                      @value={{@student.email}}
                      disabled={{true}}
                      @screenReaderOnly={{true}}
                    >
                      <:label>{{t
                          "pages.sco-organization-participants.manage-authentication-method-modal.section.email.label"
                        }}</:label>
                    </PixInput>
                    <CopyPasteButton
                      @clipBoardtext={{@student.email}}
                      @successMessage={{t
                        "pages.sco-organization-participants.manage-authentication-method-modal.copied"
                      }}
                      @defaultMessage={{t
                        "pages.sco-organization-participants.manage-authentication-method-modal.section.email.copy"
                      }}
                      @tooltipPosition="top"
                    />
                  </div>
                </div>
              </div>
            {{/if}}

            <div class="manage-authentication-window__box">
              {{#if @student.displayAddUsernameAuthentication}}
                <div class="manage-authentication-window__subTitle">
                  <h3>
                    {{t
                      "pages.sco-organization-participants.manage-authentication-method-modal.section.add-username.label"
                    }}
                  </h3>
                  <PixIcon @name="checkCircle" class="grey-icon" />
                </div>
                <PixButton @triggerAction={{this.generateUsernameWithTemporaryPassword}}>
                  {{t
                    "pages.sco-organization-participants.manage-authentication-method-modal.section.add-username.button"
                  }}
                </PixButton>
              {{else}}
                {{#if @student.hasUsername}}
                  <div class="manage-authentication-window__subTitle">
                    <h3>
                      {{t
                        "pages.sco-organization-participants.manage-authentication-method-modal.section.username.label"
                      }}
                    </h3>
                    <PixIcon @name="checkCircle" class="green-icon" />
                  </div>
                  <div class="input-container">
                    <div class="manage-authentication-window__clipboard">
                      <PixInput
                        @id="username"
                        @value={{@student.username}}
                        disabled={{true}}
                        @screenReaderOnly={{true}}
                      >
                        <:label>{{t
                            "pages.sco-organization-participants.manage-authentication-method-modal.section.username.label"
                          }}</:label>
                      </PixInput>
                      <CopyPasteButton
                        @clipBoardtext={{@student.username}}
                        @successMessage={{t
                          "pages.sco-organization-participants.manage-authentication-method-modal.copied"
                        }}
                        @defaultMessage={{t
                          "pages.sco-organization-participants.manage-authentication-method-modal.section.username.copy"
                        }}
                        @tooltipPosition="top"
                      />
                    </div>
                  </div>
                {{/if}}
              {{/if}}
            </div>

            {{#if @student.isBlockedOrTemporarilyBlocked}}
              <div class="manage-authentication-window__box">
                <div class="manage-authentication-window__subTitle">
                  <h3>
                    {{t
                      "pages.sco-organization-participants.manage-authentication-method-modal.section.unblock.subtitle"
                    }}
                  </h3>
                  <PixIcon @name="checkCircle" class="grey-icon" />
                </div>
                <PixButton @triggerAction={{this.unblockOrganizationLearnerAccount}}>
                  {{t "pages.sco-organization-participants.manage-authentication-method-modal.section.unblock.button"}}
                </PixButton>
              </div>
            {{/if}}
          </div>

          {{#unless @student.isAuthenticatedWithGarOnly}}
            <div class="manage-authentication-window__footer">
              {{#if this.isUniquePasswordVisible}}
                <div>
                  <div class="input-container">
                    <div class="manage-authentication-window__clipboard">
                      <PixInput @id="generated-password" @value={{this.generatedPassword}} disabled={{true}}>
                        <:label>{{t
                            "pages.sco-organization-participants.manage-authentication-method-modal.section.password.label"
                          }}</:label>
                      </PixInput>
                      <CopyPasteButton
                        @clipBoardtext={{this.generatedPassword}}
                        @successMessage={{t
                          "pages.sco-organization-participants.manage-authentication-method-modal.copied"
                        }}
                        @defaultMessage={{t
                          "pages.sco-organization-participants.manage-authentication-method-modal.section.password.copy"
                        }}
                        @tooltipPosition="bottom-left"
                        class="manage-authentication-window__clipboard__copy-password-button"
                      />
                    </div>
                  </div>

                  <ol class="manage-authentication-window__informations">
                    <li>
                      {{t
                        "pages.sco-organization-participants.manage-authentication-method-modal.section.password.warning-1"
                      }}
                    </li>
                    <li>
                      {{t
                        "pages.sco-organization-participants.manage-authentication-method-modal.section.password.warning-2"
                      }}
                    </li>
                    <li>
                      {{t
                        "pages.sco-organization-participants.manage-authentication-method-modal.section.password.warning-3"
                      }}
                    </li>
                  </ol>
                </div>
              {{else}}
                <div>
                  <PixButton id="generate-password" @triggerAction={{this.resetPassword}}>
                    {{t
                      "pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.button"
                    }}
                  </PixButton>

                  <div class="manage-authentication-window__warning">
                    <PixIcon @name="warning" @plainIcon={{true}} class="icon--warning" />
                    <span>{{t
                        "pages.sco-organization-participants.manage-authentication-method-modal.section.reset-password.warning"
                      }}</span>
                  </div>
                </div>
              {{/if}}
            </div>
          {{/unless}}
        </form>
      </:content>
    </PixModal>
  </template>
}
