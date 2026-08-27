import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { and, eq } from 'ember-truth-helpers';
import List from 'pix-orga/components/attestations/list';

import PageTitle from './ui/page-title';

export const SIXTH_GRADE_ATTESTATION_KEY = 'SIXTH_GRADE';
export const PARENTHOOD_ATTESTATION_KEY = 'PARENTHOOD';

export default class Attestations extends Component {
  @service currentUser;
  @service intl;

  get displaySixthGrade() {
    return (
      this.args.availableAttestations.some((attestation) => attestation.key === SIXTH_GRADE_ATTESTATION_KEY) &&
      this.args.divisions != undefined
    );
  }

  get availableAttestations() {
    if (this.displaySixthGrade) {
      const attestations = this.args.availableAttestations.filter(
        (attestation) => attestation.key != SIXTH_GRADE_ATTESTATION_KEY,
      );
      return attestations;
    }
    return this.args.availableAttestations;
  }

  get displayAttestations() {
    return this.availableAttestations.length > 0;
  }

  <template>
    <PageTitle>
      <:title>{{t "pages.attestations.title"}}</:title>
    </PageTitle>

    <section>
      <h2 class="attestations-page__section-title attestations-page__section-title--download">{{t
          "pages.attestations.section.download"
        }}</h2>

      {{#if this.displaySixthGrade}}
        <SixthGrade @divisions={{@divisions}} @onSubmit={{@onSubmit}} />
      {{/if}}

      {{#if (and this.displaySixthGrade this.displayAttestations)}}
        <div class="attestations-page__separator" />
      {{/if}}

      {{#if this.displayAttestations}}
        <OtherAttestations
          @attestations={{this.availableAttestations}}
          @selectedAttestation={{@currentAttestation.key}}
          @onFilter={{@onFilter}}
          @onSubmit={{@onSubmit}}
        />
      {{/if}}
    </section>

    <section class="attestation-page__list">
      <h2 class="attestations-page__section-title attestations-page__section-title--list">
        {{t "pages.attestations.section.list" attestationName=@currentAttestation.label}}
      </h2>
      <List
        @participantStatuses={{@participantStatuses}}
        @clearFilters={{@clearFilters}}
        @onFilter={{@onFilter}}
        @searchFilter={{@searchFilter}}
        @statusesFilter={{@statusesFilter}}
        @divisionsFilter={{@divisionsFilter}}
        @divisionsOptions={{@divisions}}
      />
    </section>
  </template>
}

class OtherAttestations extends Component {
  @service intl;

  get options() {
    return this.args.attestations.map((attestation) => ({
      value: attestation.key,
      label: attestation.label,
    }));
  }

  @action
  async onSubmit(event) {
    event.preventDefault();

    await this.args.onSubmit(this.args.selectedAttestation, []);
    this.args.onFilter('attestationKey', null);
  }

  @action
  onSelectedAttestationChange(value) {
    if (value === '') {
      this.args.onFilter('attestationKey', null);
    } else {
      this.args.onFilter('attestationKey', value);
    }
  }

  <template>
    <div>
      <p class="attestations-page__text">
        {{t "pages.attestations.basic-description"}}
      </p>
      <form class="attestations-page__action" {{on "submit" this.onSubmit}}>
        <PixSelect
          @value={{@selectedAttestation}}
          @options={{this.options}}
          @onChange={{this.onSelectedAttestationChange}}
          @texts={{hash placeholder=(t "common.filters.placeholder")}}
        >
          <:label>{{t "pages.attestations.select-label"}}</:label>
        </PixSelect>
        <PixButton
          @type="submit"
          @isDisabled={{eq this.selectedAttestation null}}
          @triggerAction={{this.onSubmit}}
          @size="small"
        >
          {{t "pages.attestations.download-attestations-button"}}
        </PixButton>
      </form>
    </div>
  </template>
}

class SixthGrade extends Component {
  @tracked selectedDivisions = [];
  @tracked isLoading = false;
  @service locale;

  @action
  async onSubmit() {
    this.isLoading = true;
    await this.args.onSubmit(SIXTH_GRADE_ATTESTATION_KEY, this.selectedDivisions);
    this.isLoading = false;
  }

  @action
  onSelectDivision(value) {
    this.selectedDivisions = value;
  }

  get isDisabled() {
    return !this.selectedDivisions.length || this.isLoading;
  }

  <template>
    <div class="attestations-page__action">
      <PixMultiSelect
        @isSearchable={{true}}
        @texts={{hash placeholder=(t "common.filters.placeholder") searchLabel=(t "common.filters.search-label-list")}}
        @options={{@divisions}}
        @values={{this.selectedDivisions}}
        @onChange={{this.onSelectDivision}}
      >
        <:label>{{t "pages.attestations.select-divisions-label"}}</:label>
        <:default as |option|>{{option.label}}</:default>
      </PixMultiSelect>
      <PixButton @triggerAction={{this.onSubmit}} @size="small" @isDisabled={{this.isDisabled}}>
        {{t "pages.attestations.download-attestations-button"}}
      </PixButton>
    </div>
  </template>
}
