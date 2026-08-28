import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { concat, fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { and, eq, not, or } from 'ember-truth-helpers';
import lodashGet from 'lodash/get';
import lodashSet from 'lodash/set';
import Organization from 'pix-admin/models/organization';

import Card from '../card';

export default class OrganizationFeaturesSection extends Component {
  @service accessControl;
  @service intl;
  @service store;
  @service pixToast;

  @tracked form = {};
  @tracked importFormats = [];
  @tracked attestations = [];
  @tracked displayLearnerImportActivationDialog = false;
  @tracked learnerImportActivationConfirmed = false;

  constructor() {
    super(...arguments);
    this.#initForm();
    this.#loadAsyncData();
  }

  async #loadAsyncData() {
    this.importFormats = await this.store.findAll('organization-learner-import-format');
    this.attestations = await this.store.findAll('attestation');
  }

  #initForm() {
    this.form = {
      features: structuredClone(this.args.organization.features),
    };
  }

  get importFormatOptions() {
    return this.importFormats.map((importFormat) => ({
      value: importFormat.name,
      label: importFormat.name,
    }));
  }

  get attestationOptions() {
    return this.attestations.map((attestation) => ({
      value: attestation.key,
      label: attestation.label,
    }));
  }

  get isManagingStudentAvailable() {
    return this.args.organization.isOrganizationSCO || this.args.organization.isOrganizationSUP;
  }

  get isManagingStudentDisabled() {
    return this.form.features?.LEARNER_IMPORT?.active;
  }

  get isLearnerImportDisabled() {
    return this.form.features?.IS_MANAGING_STUDENTS?.active;
  }

  get editableFeatureList() {
    return Organization.editableFeatureList;
  }

  get hasFormChanged() {
    return JSON.stringify(this.form.features) !== JSON.stringify(this.args.organization.features);
  }

  get isFormValid() {
    const attestations = this.form.features?.ATTESTATIONS_MANAGEMENT;
    if (attestations?.active && !attestations.params?.length) {
      return false;
    }
    const importFormat = this.form.features?.LEARNER_IMPORT;
    if (importFormat?.active && !importFormat.params?.name) {
      return false;
    }
    return true;
  }

  get isAttestationsInvalid() {
    const attestations = this.form.features?.ATTESTATIONS_MANAGEMENT;
    return attestations?.active && !(attestations.params?.length > 0);
  }

  get learnerImportError() {
    const importFormat = this.form.features?.LEARNER_IMPORT;
    if (importFormat?.active && !importFormat.params?.name) {
      return this.intl.t('components.organizations.editing.organization-learner-import-format.selector.error');
    }
    return null;
  }

  @action
  cancelChanges() {
    this.#initForm();
  }

  @action
  updateFormCheckBoxValue(key) {
    if (key === 'features.LEARNER_IMPORT.active') {
      this.form = lodashSet(this.form, 'features.LEARNER_IMPORT', {
        active: !this.form.features?.LEARNER_IMPORT?.active,
      });
      if (this.form.features.LEARNER_IMPORT.active && !this.args.organization.features?.LEARNER_IMPORT?.active) {
        this.displayLearnerImportActivationDialog = true;
        this.learnerImportActivationConfirmed = false;
      }
      return;
    }
    this.form = lodashSet(this.form, key, !lodashGet(this.form, key));

    if (key === 'features.PLACES_MANAGEMENT.active') {
      const shouldPlacesLimitBeChecked = Boolean(this.form.features?.PLACES_MANAGEMENT?.active);
      this.form = lodashSet(
        this.form,
        'features.PLACES_MANAGEMENT.params.enableMaximumPlacesLimit',
        shouldPlacesLimitBeChecked,
      );
    }
  }

  @action
  closeLearnerImportActivationDialog() {
    this.displayLearnerImportActivationDialog = false;
    this.updateFormCheckBoxValue('features.LEARNER_IMPORT.active');
  }

  @action
  toggleConfirmLearnerImportActivation() {
    this.learnerImportActivationConfirmed = !this.learnerImportActivationConfirmed;
  }

  @action
  confirmLearnerImportActivation() {
    if (this.learnerImportActivationConfirmed) {
      this.displayLearnerImportActivationDialog = false;
    }
  }

  @action
  updateValue(key, value) {
    this.form = lodashSet(this.form, key, value);
  }

  @action
  async saveFeatures(event) {
    event.preventDefault();
    if (!this.hasFormChanged || !this.isFormValid) return;
    this.args.organization.set('features', this.form.features);
    await this.args.onSubmit();
    this.#initForm();
  }

  <template>
    <div class="organization__data">
      <form class="admin-form" {{on "submit" this.saveFeatures}}>
        <section class="admin-form__content">
          <Card
            class="admin-form__card organization-features-form__card"
            @title={{t "components.organizations.creation.features"}}
          >
            <FeaturesForm
              @form={{this.form}}
              @importFormatOptions={{this.importFormatOptions}}
              @attestationOptions={{this.attestationOptions}}
              @isAttestationsInvalid={{this.isAttestationsInvalid}}
              @updateFormCheckBoxValue={{this.updateFormCheckBoxValue}}
              @updateValue={{this.updateValue}}
              @isManagingStudentAvailable={{this.isManagingStudentAvailable}}
              @isManagingStudentDisabled={{this.isManagingStudentDisabled}}
              @isLearnerImportDisabled={{this.isLearnerImportDisabled}}
              @editableFeatureList={{this.editableFeatureList}}
              @learnerImportError={{this.learnerImportError}}
              @canEdit={{this.accessControl.hasAccessToOrganizationActionsScope}}
            />
          </Card>
        </section>
        {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
          <section class="admin-form__actions">
            <PixButton
              @size="small"
              @variant="secondary"
              @triggerAction={{this.cancelChanges}}
              @isDisabled={{not this.hasFormChanged}}
            >
              {{t "common.actions.cancel"}}
            </PixButton>
            <PixButton
              @type="submit"
              @size="small"
              @variant="success"
              @isDisabled={{or (not this.hasFormChanged) (not this.isFormValid)}}
            >
              {{t "common.actions.save"}}
            </PixButton>
          </section>
        {{/if}}
      </form>

      <PixModal
        @title={{t "components.organizations.editing.organization-learner-import-format.dialog.title"}}
        @onCloseButtonClick={{this.closeLearnerImportActivationDialog}}
        @showModal={{this.displayLearnerImportActivationDialog}}
      >
        <:content>
          <p>
            {{t "components.organizations.editing.organization-learner-import-format.dialog.message"}}
          </p>
          <p>
            <PixCheckbox
              @checked={{this.learnerImportActivationConfirmed}}
              {{on "change" this.toggleConfirmLearnerImportActivation}}
            >
              <:label>
                <strong>
                  {{t "components.organizations.editing.organization-learner-import-format.dialog.confirmation"}}
                </strong>
              </:label>
            </PixCheckbox>
          </p>
        </:content>
        <:footer>
          <PixButton @variant="secondary" @triggerAction={{this.closeLearnerImportActivationDialog}}>
            {{t "common.actions.cancel"}}
          </PixButton>
          <PixButton @variant="error" @triggerAction={{this.confirmLearnerImportActivation}}>
            {{t "common.actions.confirm"}}
          </PixButton>
        </:footer>
      </PixModal>
    </div>
  </template>
}

function keys(obj) {
  return Object.keys(obj);
}

const FeaturesForm = <template>
  {{#each (keys Organization.featureList) as |feature|}}
    {{#let
      (get @form.features feature)
      (concat "components.organizations.information-section-view.features." feature)
      (get @editableFeatureList feature)
      as |organizationFeature featureLabel isEditable|
    }}
      {{#if isEditable}}
        <div class="features-section__feature-item">
          <div class="form-field">
            <PixCheckbox
              @checked={{organizationFeature.active}}
              disabled={{or
                (not @canEdit)
                (and
                  (eq feature "IS_MANAGING_STUDENTS") (or @isManagingStudentDisabled (not @isManagingStudentAvailable))
                )
                (and
                  (eq feature "LEARNER_IMPORT") (or @isLearnerImportDisabled (eq (get @importFormatOptions "length") 0))
                )
              }}
              {{on "change" (fn @updateFormCheckBoxValue (concat "features." feature ".active"))}}
            >
              <:label>
                {{t featureLabel}}
              </:label>
            </PixCheckbox>
            {{#if (and (eq feature "LEARNER_IMPORT") (get organizationFeature "active"))}}
              <PixSelect
                required
                size="small"
                @aria-required={{true}}
                @texts={{hash
                  placeholder=(t
                    "components.organizations.editing.organization-learner-import-format.selector.placeholder"
                  )
                  requiredLabel=(t "common.forms.mandatory")
                }}
                @options={{@importFormatOptions}}
                @value={{organizationFeature.params.name}}
                @onChange={{fn @updateValue "features.LEARNER_IMPORT.params.name"}}
                @hideDefaultOption={{true}}
                @isFullWidth={{false}}
                @isDisabled={{not @canEdit}}
                @errorMessage={{@learnerImportError}}
              >
                <:label>
                  {{t "components.organizations.editing.organization-learner-import-format.selector.label"}}
                </:label>
              </PixSelect>
            {{/if}}

            {{#if (and (eq feature "ATTESTATIONS_MANAGEMENT") (get organizationFeature "active"))}}
              <PixMultiSelect
                class="features-section__attestations-select
                  {{if @isAttestationsInvalid 'features-section__attestations-select--error'}}"
                @size="small"
                @texts={{hash
                  placeholder=(t "components.organizations.editing.attestations.selector.placeholder")
                  searchLabel="Rechercher"
                }}
                @isSearchable={{true}}
                @values={{get organizationFeature "params"}}
                @options={{@attestationOptions}}
                @onChange={{fn @updateValue "features.ATTESTATIONS_MANAGEMENT.params"}}
                @isDisabled={{not @canEdit}}
              >
                <:label>
                  {{t "components.organizations.editing.attestations.selector.label"}}
                </:label>
                <:default as |option|>
                  {{option.label}}
                </:default>
              </PixMultiSelect>
              {{#if @isAttestationsInvalid}}
                <p class="features-section__attestations-error">
                  {{t "components.organizations.editing.attestations.selector.error"}}
                </p>
              {{/if}}
            {{/if}}
          </div>
          {{#if (eq feature "PLACES_MANAGEMENT")}}
            <div class="form-field">
              <PixCheckbox
                @checked={{organizationFeature.params.enableMaximumPlacesLimit}}
                disabled={{not (and @canEdit (get organizationFeature "active"))}}
                {{on
                  "change"
                  (fn @updateFormCheckBoxValue (concat "features." feature ".params.enableMaximumPlacesLimit"))
                }}
              >
                <:label>
                  {{t "components.organizations.information-section-view.features.ORGANIZATION_PLACES_LIMIT.label"}}
                </:label>
              </PixCheckbox>
            </div>
          {{/if}}
        </div>
      {{else}}
        <div class="features-section__feature-item">
          <div class="form-field">
            <PixCheckbox @checked={{organizationFeature.active}} disabled>
              <:label>
                {{t featureLabel}}
              </:label>
            </PixCheckbox>
          </div>
        </div>
      {{/if}}
    {{/let}}
  {{/each}}
</template>;
