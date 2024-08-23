import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import Card from '../card';

export default class OrganizationCreationForm extends Component {
  organizationTypes = [
    { value: 'PRO', label: 'Organisation professionnelle' },
    { value: 'SCO', label: 'Établissement scolaire' },
    { value: 'SUP', label: 'Établissement supérieur' },
    { value: 'SCO-1D', label: 'Établissement scolaire du premier degré' },
  ];

  @action
  handleOrganizationTypeSelectionChange(value) {
    this.args.organization.type = value;
  }

  @action
  handleOrganizationNameChange(event) {
    this.args.organization.name = event.target.value;
  }

  @action
  handleDocumentationUrlChange(event) {
    this.args.organization.documentationUrl = event.target.value;
  }

  @action
  handleCreditsChange(event) {
    this.args.organization.credit = +event.target.value;
  }

  @action
  handleDataProtectionOfficerFirstNameChange(event) {
    this.args.organization.dataProtectionOfficerFirstName = event.target.value;
  }

  @action
  handleDataProtectionOfficerLastNameChange(event) {
    this.args.organization.dataProtectionOfficerLastName = event.target.value;
  }

  @action
  handleDataProtectionOfficerEmailChange(event) {
    this.args.organization.dataProtectionOfficerEmail = event.target.value;
  }

  <template>
    <form class="admin-form" {{on "submit" @onSubmit}}>

      <section class="admin-form__content admin-form__content--with-counters">
        <Card class="admin-form__card" @title="Information générique">
          <PixInput
            @id="organizationName"
            onchange={{this.handleOrganizationNameChange}}
            required={{true}}
            aria-required={{true}}
          >
            <:label>Nom</:label>
          </PixInput>

          <PixSelect
            @onChange={{this.handleOrganizationTypeSelectionChange}}
            @options={{this.organizationTypes}}
            @placeholder="Type d'organisation"
            @hideDefaultOption={{true}}
            @value={{@organization.type}}
            required
            aria-required={{true}}
          >
            <:label>Sélectionner un type d'organisation</:label>
            <:default as |organizationType|>{{organizationType.label}}</:default>
          </PixSelect>
        </Card>

        <Card class="admin-form__card" @title="Configuration">
          <PixInput @id="documentationUrl" onchange={{this.handleDocumentationUrlChange}}>
            <:label>Lien vers la documentation</:label>
          </PixInput>
          <PixInput @id="credits" onchange={{this.handleCreditsChange}} type="number">
            <:label>Crédits</:label>
          </PixInput>
        </Card>

        <Card class="admin-form__card" @title="Data Privacy Officer">
          <PixInput @id="dataProtectionOfficerFirstName" onchange={{this.handleDataProtectionOfficerFirstNameChange}}>
            <:label>Prénom du DPO</:label>
          </PixInput>
          <PixInput @id="dataProtectionOfficerLastName" onchange={{this.handleDataProtectionOfficerLastNameChange}}>
            <:label>Nom du DPO</:label>
          </PixInput>
          <PixInput @id="dataProtectionOfficerEmail" onchange={{this.handleDataProtectionOfficerEmailChange}}>
            <:label>Adresse e-mail du DPO</:label>
          </PixInput>
        </Card>
      </section>

      <section class="admin-form__actions">
        <PixButton @size="small" @variant="secondary" @triggerAction={{@onCancel}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @type="submit" @size="small" @variant="success">
          {{t "common.actions.add"}}
        </PixButton>
      </section>
    </form>
  </template>
}
