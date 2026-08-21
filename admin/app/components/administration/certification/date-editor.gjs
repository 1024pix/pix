import { PixButton, PixInput } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class DateEditor extends Component {
  @service intl;
  @tracked isEditing = false;
  @tracked dateInput;

  get displayText() {
    const date = this.args.date?.reopeningDate;
    if (!date) return this.intl.t('pages.administration.certification.sco-blocked-access-date.not-configured');
    return `${date.toLocaleDateString('fr-FR')} ${this.intl.t('pages.administration.certification.sco-blocked-access-date.hour')}`;
  }

  @action
  toggleEdit() {
    this.isEditing = !this.isEditing;

    if (!this.isEditing) {
      this.dateInput = null;
    }
  }

  @action
  updateInput(event) {
    this.dateInput = event.target.value;
  }

  @action
  async save(event) {
    event.preventDefault();
    await this.args.onSave(this.dateInput);
    this.toggleEdit();
  }

  <template>
    <div class="sco-blocked-access-date-configuration__section">
      {{#if this.isEditing}}
        <form class="sco-blocked-access-date-configuration__form" {{on "submit" this.save}}>
          <PixInput type="date" @value={{this.dateInput}} {{on "change" this.updateInput}}>
            <:label><span class="pix-body-l">{{@label}}</span></:label>
          </PixInput>
          <PixButton @variant="secondary" @type="submit">
            {{t "pages.administration.certification.sco-blocked-access-date.save-button"}}
          </PixButton>
          <PixButton @variant="tertiary" @type="reset" @triggerAction={{this.toggleEdit}}>
            {{t "pages.administration.certification.sco-blocked-access-date.cancel-button"}}
          </PixButton>
        </form>
      {{else}}
        <span class="pix-body-l">{{@label}} {{this.displayText}}</span>
        <PixButton @variant="secondary" @triggerAction={{this.toggleEdit}}>
          {{t "pages.administration.certification.sco-blocked-access-date.modify-button"}}
        </PixButton>
      {{/if}}
    </div>
  </template>
}
