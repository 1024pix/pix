import { PixBlock, PixButtonLink, PixSelect } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ObjectRequirementForm from 'pix-admin/components/quests/requirements/object/form';
import { objectConfigurations } from 'pix-admin/components/quests/requirements/object/object-configuration.js';

import PageTitle from '../../ui/page-title';
import SnippetList from '../snippets/list';

const LOCAL_STORAGE_KEY = 'QUEST_REQUIREMENT_SNIPPETS';

export default class RequirementForm extends Component {
  @service pixToast;
  @service router;

  @tracked selectedRequirementType = null;
  @tracked requirementLabel = null;
  @tracked requirementComparison = null;
  @tracked requirementFields = null;
  @tracked formFields = null;

  get requirementTypeOptions() {
    return Object.values(objectConfigurations).map(({ name, label }) => ({ value: name, label }));
  }

  get configurationForSelectedRequirement() {
    return objectConfigurations[this.selectedRequirementType];
  }

  @action
  updateLabel(event) {
    this.requirementLabel = event.target.value;
  }

  @action
  updateComparison(value) {
    this.requirementComparison = value;
  }

  @action
  editRequirement(label) {
    const snippets = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) ?? {
      objectRequirementsByLabel: {},
    };

    this.requirementLabel = label;
    this.requirementComparison = snippets.objectRequirementsByLabel[label].comparison;
    this.requirementFields = snippets.objectRequirementsByLabel[label].data;

    this.updateRequirementType(snippets.objectRequirementsByLabel[label].requirement_type, true);
  }

  @action
  updateRequirementType(value, isEditing = false) {
    if (!isEditing) this.resetRequirement();

    this.selectedRequirementType = value;
    this.requirementComparison = objectConfigurations[this.selectedRequirementType].mergeFields
      ? 'all'
      : this.requirementComparison;
    this.formFields = objectConfigurations[this.selectedRequirementType].fieldConfigurations.map(
      (fieldConfiguration) => {
        const field = isEditing && this.requirementFields[fieldConfiguration.name];
        return {
          name: fieldConfiguration.name,
          comparison: isEditing && field ? field.comparison : undefined,
          data: isEditing && field ? field.data : undefined,
        };
      },
    );
  }

  @action
  resetRequirement() {
    this.requirementComparison = null;
    this.requirementLabel = null;
    this.requirementFields = null;
  }

  @action
  updateField({ name, comparison, value }) {
    const field = this.formFields.find((field) => field.name === name);
    field.comparison = comparison;
    field.data = value;
  }

  @action
  saveSnippet(event) {
    event.preventDefault();
    try {
      const requirement = this.configurationForSelectedRequirement.buildRequirementFromFormValues(
        this.requirementComparison,
        this.formFields,
      );
      const snippets = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) ?? {
        objectRequirementsByLabel: {},
      };
      snippets.objectRequirementsByLabel[this.requirementLabel] = requirement;
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(snippets));
      this.pixToast.sendSuccessNotification({ message: 'Le requirement est ajouté dans le local storage.' });

      this.selectedRequirementType = null;
      this.resetRequirement();
    } catch {
      this.pixToast.sendErrorNotification({ message: "Le requirement n'a pas pu être ajouté." });
    }
  }

  <template>
    <PageTitle>
      <:title>Créer ou Éditer un "requirement" de quête</:title>
    </PageTitle>
    <section class="quest-object-form">
      <PixBlock @variant="admin" class="quest-requirement-form">
        <PixSelect
          class="quest-requirement-form__item-width-content"
          @onChange={{this.updateRequirementType}}
          @value={{this.selectedRequirementType}}
          @options={{this.requirementTypeOptions}}
          @placeholder="Choisissez votre type de requirement"
          @hideDefaultOption={{true}}
        >
          <:label>Sélectionner un type de requirement</:label>
        </PixSelect>

        <div>
          {{#if this.selectedRequirementType}}
            <ObjectRequirementForm
              @configuration={{this.configurationForSelectedRequirement}}
              @requirementLabel={{this.requirementLabel}}
              @requirementComparison={{this.requirementComparison}}
              @requirementFields={{this.requirementFields}}
              @updateLabel={{this.updateLabel}}
              @updateField={{this.updateField}}
              @updateComparison={{this.updateComparison}}
              @saveSnippet={{this.saveSnippet}}
              @formFields={{this.formFields}}
            />
          {{/if}}
        </div>
      </PixBlock>

      <PixBlock @variant="admin" class="quest-button-edition quest-button-edition--column">
        <h2>Editer mes snippets :</h2>
        <SnippetList @triggerAction={{this.editRequirement}} />
      </PixBlock>

      <div class="quest-button-edition__button">
        <PixButtonLink @route="authenticated.quest-creator" @size="small" @variant="primary">
          Revenir au formulaire de quête
        </PixButtonLink>
      </div>
    </section>
  </template>
}
