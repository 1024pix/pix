import { PixButton, PixInput, PixRadioButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';
import FormField from 'pix-admin/components/quests/requirements/object/form-field';
import PixFieldset from 'pix-admin/components/ui/pix-fieldset';

/**
 * @param {ObjectConfiguration} configuration
 * @param {string} requirementLabel
 * @param {string} requirementComparison
 * @param {{fieldComparison: String, fieldValue: Any, fieldName: String}[]} requirementFields
 */
export default class ObjectRequirementCreateOrEditForm extends Component {
  @action
  getFieldComparisonForName(name) {
    return this.args.formFields.find((field) => field.name === name).comparison;
  }

  @action
  getFieldValueForName(name) {
    return this.args.formFields.find((field) => field.name === name).data;
  }

  <template>
    <form class="quest-object-form" {{on "submit" @saveSnippet}}>
      <PixInput
        class="quest-requirement-form__item-width-content"
        onchange={{@updateLabel}}
        @value={{@requirementLabel}}
        required={{true}}
        aria-required={{true}}
      >
        <:label>Nom de la condition</:label>
      </PixInput>

      {{#unless @configuration.mergeFields}}
        <PixFieldset role="radiogroup">
          <:title>Comment évaluer la condition ?</:title>
          <:content>
            <PixRadioButton
              name="comparison"
              @value="all-condition"
              {{on "change" (fn @updateComparison "all")}}
              checked={{eq @requirementComparison "all"}}
            >
              <:label>Tous les critères sont remplis</:label>
            </PixRadioButton>
            <PixRadioButton
              name="comparison"
              @value="on-off-condition"
              {{on "change" (fn @updateComparison "one-of")}}
              checked={{eq @requirementComparison "one-of"}}
            >
              <:label>Au moins un critère est rempli</:label>
            </PixRadioButton>
          </:content>
        </PixFieldset>
      {{/unless}}

      {{#each @configuration.fieldConfigurations as |fieldConfiguration|}}
        <FormField
          @fieldConfiguration={{fieldConfiguration}}
          @onFieldUpdated={{@updateField}}
          @fieldComparison={{this.getFieldComparisonForName fieldConfiguration.name}}
          @fieldValue={{this.getFieldValueForName fieldConfiguration.name}}
        />
      {{/each}}
      <PixButton @type="submit" @size="small" @variant="success">
        Ajouter
      </PixButton>
    </form>
  </template>
}
