import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

export default class CertificationInfoField extends Component {
  get valueWithSuffix() {
    if (this.args.suffix) {
      return `${this.args.value} ${this.args.suffix}`;
    }
    return this.args.value;
  }

  <template>
    <div class="certification-info-field">
      {{#if @edition}}
        <label for={{@fieldId}} class="certification-info-field__label">
          {{@label}}
        </label>
        {{#if @isTextarea}}
          <PixTextarea id={{@fieldId}} @value={{@value}} class="form-control" ...attributes />
        {{else}}
          <PixInput id={{@fieldId}} @type="text" @value={{@value}} class="form-control" ...attributes />
        {{/if}}
        {{#if @suffix}}
          <span class="certification-info-field__suffix">{{@suffix}}</span>
        {{/if}}
      {{else}}
        <p>{{@label}}</p>
        {{#if @linkRoute}}
          <LinkTo @route={{@linkRoute}} @model={{@value}} class="certification-info-field__link">
            {{this.valueWithSuffix}}
          </LinkTo>
        {{else}}
          <p class={{@class}}>
            {{if this.valueWithSuffix this.valueWithSuffix " - "}}
          </p>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
