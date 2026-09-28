import { PixButton, PixInput, PixLabel, PixTextarea } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';

export default class SessionEditionFormComponent extends Component {
  @service router;
  @service intl;
  @service pixToast;

  @tracked isSubmitting = false;

  get todayDate() {
    return new Date().toISOString().split('T')[0];
  }

  get isUpdateMode() {
    return !!this.args.session?.id;
  }

  @action
  async submitSession(event) {
    event.preventDefault();

    if (!event.target.checkValidity() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      await this.args.session.save();
    } catch (responseError) {
      this.isSubmitting = false;

      const error = responseError?.errors?.[0];

      if (error?.code) {
        return this.pixToast.sendErrorNotification({ message: this.intl.t(`common.api-error-messages.${error.code}`) });
      }
      if (this.isUpdateMode && this._isEntityUnprocessable(responseError)) {
        return this.pixToast.sendErrorNotification({
          message: this.intl.t('common.api-error-messages.bad-request-error'),
        });
      }
      if (!this.isUpdateMode && error?.status === '400') {
        return this.pixToast.sendErrorNotification({
          message: this.intl.t('common.api-error-messages.bad-request-error'),
        });
      }
      return this.pixToast.sendErrorNotification({
        message: this.intl.t('common.api-error-messages.internal-server-error'),
      });
    }

    this.router.transitionTo('authenticated.sessions.details', this.args.session.id);
  }

  @action
  cancel() {
    if (this.isUpdateMode) {
      this.router.transitionTo('authenticated.sessions.details', this.args.session.id);
    } else {
      this.router.transitionTo('authenticated.sessions');
    }
  }

  @action
  onChangeAddress(event) {
    this.args.session.address = event.target.value;
  }

  @action
  onChangeRoom(event) {
    this.args.session.room = event.target.value;
  }

  @action
  onDateChange(event) {
    this.args.session.date = event.target.value;
  }

  @action
  onTimeChange(event) {
    this.args.session.time = event.target.value;
  }

  @action
  onChangeExaminer(event) {
    this.args.session.examiner = event.target.value;
  }

  @action
  onChangeDescription(event) {
    this.args.session.description = event.target.value;
  }

  _isEntityUnprocessable(err) {
    const status = get(err, 'errors[0].status');
    return status === '422' || status === '400';
  }

  <template>
    <div>
      <form {{on 'submit' this.submitSession}} class='session-edition-form'>
        <p class='session-edition-form__mandatory-information'>
          {{t 'common.forms.mandatory-fields' htmlSafe=true}}
        </p>

        <PixInput
          @id='session-address'
          @requiredLabel={{t 'common.forms.required'}}
          maxlength='255'
          required
          {{on 'change' this.onChangeAddress}}
          @value={{if this.isUpdateMode @session.address ''}}
        >
          <:label>{{t 'common.forms.session-labels.center-name'}}</:label>
        </PixInput>

        <PixInput
          @id='session-room'
          @requiredLabel={{t 'common.forms.required'}}
          maxlength='255'
          {{on 'change' this.onChangeRoom}}
          @value={{if this.isUpdateMode @session.room ''}}
          required
        >
          <:label>{{t 'common.forms.session-labels.room-name'}}</:label>
        </PixInput>

        <div class='session-edition-form__field'>
          <PixLabel @requiredLabel={{t 'common.forms.required'}} for='session-date'>
            {{t 'common.forms.session-labels.date-start'}}
          </PixLabel>
          <input
            id='session-date'
            type='date'
            name='session-date'
            class='input input--small'
            min={{if this.isUpdateMode null this.todayDate}}
            value={{if this.isUpdateMode @session.date ''}}
            {{on 'change' this.onDateChange}}
            required
          />
        </div>

        <div class='session-edition-form__field'>
          <PixLabel @requiredLabel={{t 'common.forms.required'}} for='session-time'>
            {{t 'common.forms.session-labels.time-start'}}
          </PixLabel>
          <input
            id='session-time'
            type='time'
            name='session-time'
            class='input input--small'
            value={{if this.isUpdateMode @session.time ''}}
            {{on 'change' this.onTimeChange}}
            required
          />
        </div>

        <PixInput
          @id='session-examiner'
          @requiredLabel={{t 'common.forms.required'}}
          maxlength='255'
          {{on 'change' this.onChangeExaminer}}
          @value={{if this.isUpdateMode @session.examiner ''}}
          required
        >
          <:label>{{t 'common.forms.session-labels.invigilator'}}</:label>
        </PixInput>

        <PixTextarea
          @id='session-description'
          @maxlength='350'
          class='session-edition-form__textarea'
          value={{if this.isUpdateMode @session.description ''}}
          {{on 'change' this.onChangeDescription}}
        >
          <:label>{{t 'common.forms.session-labels.observations'}}</:label>
        </PixTextarea>

        <ul class='session-edition-form__actions'>
          <li>
            <PixButton
              data-test-id='session-form__cancel-button'
              @variant='secondary'
              @triggerAction={{this.cancel}}
              @isBorderVisible='true'
              aria-label={{t
                (if
                  this.isUpdateMode
                  'pages.sessions.update.actions.cancel-extra-information'
                  'pages.sessions.new.actions.cancel-extra-information'
                )
              }}
            >
              {{t 'common.actions.cancel'}}
            </PixButton>
          </li>
          <li>
            <PixButton @type='submit' @isLoading={{this.isSubmitting}}>
              {{t
                (if
                  this.isUpdateMode
                  'pages.sessions.update.actions.edit-session'
                  'pages.sessions.new.actions.create-session'
                )
              }}
            </PixButton>
          </li>
        </ul>
      </form>
    </div>
  </template>
}
