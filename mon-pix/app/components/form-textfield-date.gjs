import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

const INPUT_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input--default',
  error: 'form-textfield__input--error',
  success: 'form-textfield__input--success',
};

const MESSAGE_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__message--default',
  error: 'form-textfield__message--error',
  success: 'form-textfield__message--success',
};

const INPUT_CONTAINER_VALIDATION_STATUS_MAP = {
  default: 'form-textfield__input-container--default',
  error: 'form-textfield__input-container--error',
  success: 'form-textfield__input-container--success',
};

export default class FormTextfieldDate extends Component {
  <template>
    {{! template-lint-disable require-input-label no-unknown-arguments-for-builtin-components no-bare-strings }}
    <div class="form-textfield">
      <label class="form-textfield__label">
        {{@label}}
        {{#if @require}}<abbr title="{{t 'common.form.mandatory'}}" class="mandatory-mark">*</abbr> {{/if}}
        <br />
      </label>

      <div class="form-textfield__date">
        <PixInput
          min="1"
          max="31"
          id={{@dayTextfieldName}}
          type="number"
          @value={{@dayValue}}
          name={{@dayTextfieldName}}
          {{on "focusout" (fn @onValidateDay @dayTextfieldName @dayValue)}}
          {{on "input" @onDayInput}}
          aria-describedby={{@aria-describedby}}
          @validationStatus={{@dayValidationStatus}}
          required={{@require}}
          disabled={{@disabled}}
          aria-label={{t "pages.sco-signup-or-login.register-form.fields.birthdate.day.label"}}
          placeholder={{t "pages.sco-signup-or-login.register-form.fields.birthdate.day.placeholder"}}
        />

        <PixInput
          min="1"
          max="12"
          id={{@monthTextfieldName}}
          type="number"
          @value={{@monthValue}}
          name={{@monthTextfieldName}}
          {{on "focusout" (fn @onValidateMonth @monthTextfieldName @monthValue)}}
          {{on "input" @onMonthInput}}
          aria-describedby={{@aria-describedby}}
          @validationStatus={{@monthValidationStatus}}
          required={{@require}}
          disabled={{@disabled}}
          aria-label={{t "pages.sco-signup-or-login.register-form.fields.birthdate.month.label"}}
          placeholder={{t "pages.sco-signup-or-login.register-form.fields.birthdate.month.placeholder"}}
        />

        <PixInput
          min="1900"
          id={{@yearTextfieldName}}
          type="number"
          @value={{@yearValue}}
          name={{@yearTextfieldName}}
          {{on "focusout" (fn @onValidateYear @yearTextfieldName @yearValue)}}
          {{on "input" @onYearInput}}
          @validationStatus={{@yearValidationStatus}}
          aria-describedby={{@aria-describedby}}
          required={{@require}}
          disabled={{@disabled}}
          aria-label={{t "pages.sco-signup-or-login.register-form.fields.birthdate.year.label"}}
          placeholder={{t "pages.sco-signup-or-login.register-form.fields.birthdate.year.placeholder"}}
        />
      </div>

      {{#if @dayValidationMessage}}
        <div
          id="dayValidationMessage"
          class="form-textfield__message {{this.dayValidationMessageClass}}"
          role="alert"
        >{{@dayValidationMessage}}</div>
      {{/if}}

      {{#if @monthValidationMessage}}
        <div
          id="monthValidationMessage"
          class="form-textfield__message {{this.monthValidationMessageClass}}"
          role="alert"
        >{{@monthValidationMessage}}</div>
      {{/if}}

      {{#if @yearValidationMessage}}
        <div
          id="yearValidationMessage"
          class="form-textfield__message {{this.yearValidationMessageClass}}"
          role="alert"
        >{{@yearValidationMessage}}</div>
      {{/if}}
    </div>
  </template>
  get dayHasIcon() {
    return this.args.dayValidationStatus !== 'default' && !this.args.disabled;
  }

  get monthHasIcon() {
    return this.args.monthValidationStatus !== 'default' && !this.args.disabled;
  }

  get yearHasIcon() {
    return this.args.yearValidationStatus !== 'default' && !this.args.disabled;
  }

  get dayInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.args.dayValidationStatus] || null;
  }

  get monthInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.args.monthValidationStatus] || null;
  }

  get yearInputContainerStatusClass() {
    return INPUT_CONTAINER_VALIDATION_STATUS_MAP[this.args.yearValidationStatus] || null;
  }

  get dayInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.args.dayValidationStatus] || '';
  }

  get monthInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.args.monthValidationStatus] || '';
  }

  get yearInputValidationStatus() {
    return INPUT_VALIDATION_STATUS_MAP[this.args.yearValidationStatus] || '';
  }

  get dayValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.args.dayValidationStatus] || '';
  }

  get monthValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.args.monthValidationStatus] || '';
  }

  get yearValidationMessageClass() {
    return MESSAGE_VALIDATION_STATUS_MAP[this.args.yearValidationStatus] || '';
  }
}
