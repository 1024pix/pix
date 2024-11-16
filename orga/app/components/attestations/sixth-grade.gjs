import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class AttestationsSixthGrade extends Component {
  @tracked selectedDivisions = [];

  @action
  onSubmit(event) {
    event.preventDefault();

    this.args.onSubmit(this.selectedDivisions);
  }

  @action
  onSelectDivision(value) {
    this.selectedDivisions = value;
  }

  get isDisabled() {
    return !this.selectedDivisions.length;
  }

  <template>
    <h1 class="attestations-page__title">{{t "pages.attestations.title"}}</h1>

    <p class="attestations-page__text">
      {{t "pages.attestations.description"}}
    </p>

    <form class="attestations-page__action" {{on "submit" this.onSubmit}}>
      <PixMultiSelect
        @isSearchable={{true}}
        @options={{@divisions}}
        @values={{this.selectedDivisions}}
        @onChange={{this.onSelectDivision}}
        @placeholder={{t "pages.attestations.placeholder"}}
      >
        <:label>{{t "pages.attestations.select-label"}}</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
      <PixButton @type="submit" id="download_attestations" @size="small" @isDisabled={{this.isDisabled}}>
        {{t "pages.attestations.download-attestations-button"}}
      </PixButton>
    </form>
  </template>
}
