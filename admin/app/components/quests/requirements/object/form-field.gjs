import { PixCheckbox, PixInput, PixSelect } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

/**
 * @param {FieldConfiguration} fieldConfiguration
 * @param {function} onFieldUpdated  args: {name:string, comparison:string, value:string}
 * @param {string} fieldComparison
 * @param {string} fieldValue
 */
export default class ObjectRequirementCreateOrEditFormField extends Component {
  @tracked isFieldEnabled;
  @tracked formComparison;
  @tracked formValue;

  constructor() {
    super(...arguments);
    this.isFieldEnabled = this.args.fieldComparison || this.args.fieldConfiguration.hasSingleChoice;

    if (this.args.fieldConfiguration.hasSingleChoice) {
      this.formComparison = 'specific';
    } else {
      this.formComparison = this.args.fieldComparison ?? null;
    }

    if (this.args.fieldConfiguration.parseToObject) {
      this.formValue = JSON.stringify(this.args.fieldValue);
    } else {
      this.formValue = this.args.fieldValue ?? null;
    }
  }

  @action
  enableOrDisableField(event) {
    this.formValue = null;
    this.formComparison = null;
    this.isFieldEnabled = event.target.checked;
    this.#updateField();
  }

  @action
  updateComparison(value) {
    this.formValue = null;
    this.formComparison = value;
    this.#updateField();
  }

  @action
  updateValue(event) {
    this.formValue = event.target.value;
    this.#updateField();
  }

  #updateField() {
    this.args.onFieldUpdated({
      name: this.args.fieldConfiguration.name,
      comparison: this.formComparison,
      value: this.formValue,
    });
  }

  get isDisabled() {
    return this.args.fieldConfiguration.hasSingleChoice;
  }

  get checkboxLabel() {
    return this.args.fieldConfiguration.name + (this.isFieldEnabled ? '' : ' ?');
  }

  get typeHelpLabel() {
    const isArray = this.args.fieldConfiguration.refersToAnArray;
    if (this.args.fieldConfiguration.type === 'BOOLEAN') {
      return isArray ? 'Tableau de booléens' : 'Booléen';
    }
    if (this.args.fieldConfiguration.type === 'NUMBER') {
      return isArray ? 'Tableau de nombres' : 'Nombre';
    }
    if (this.args.fieldConfiguration.type === 'STRING') {
      return isArray ? 'Tableau de chaînes' : 'Chaîne';
    }

    return this.args.fieldConfiguration.type;
  }

  get placeholder() {
    return this.args.fieldConfiguration.allowedValues.join(',');
  }

  get comparisonOptions() {
    if (this.args.fieldConfiguration.refersToAnArray) {
      return [
        { value: 'all', label: 'possède toutes les valeurs dans' },
        { value: 'one-of', label: 'possède au moins une des valeurs dans' },
      ];
    } else {
      return [
        { value: 'equal', label: 'a exactement la valeur' },
        { value: 'one-of', label: 'a la valeur parmi' },
        { value: 'like', label: 'Contient ce texte dans la chaîne' },
      ];
    }
  }

  get inputLabel() {
    if (this.args.fieldConfiguration.hasSingleChoice) {
      return this.checkboxLabel;
    } else if (['one-of', 'all'].includes(this.formComparison)) {
      return 'Saisir les valeurs séparées par des virgules, sans espaces';
    } else if (this.formComparison === 'like') {
      return 'Saisir la valeur (string)';
    } else {
      return 'Saisir la valeur';
    }
  }

  <template>
    <div>
      {{#unless @fieldConfiguration.hasSingleChoice}}
        <PixCheckbox
          {{on "change" this.enableOrDisableField}}
          @value={{this.isFieldEnabled}}
          checked={{this.isFieldEnabled}}
        >
          <:label><b>{{this.checkboxLabel}}</b> ({{this.typeHelpLabel}})</:label>
        </PixCheckbox>
      {{/unless}}
      <div class="quest-field">
        {{#if this.isFieldEnabled}}
          {{#unless @fieldConfiguration.hasSingleChoice}}
            <PixSelect
              @onChange={{this.updateComparison}}
              @value={{this.formComparison}}
              @options={{this.comparisonOptions}}
              @hideDefaultOption={{true}}
              @hideDefaultValue={{true}}
            >
              <:label>Sélectionner une modalité de comparaison</:label>
            </PixSelect>
          {{/unless}}

          {{#if this.formComparison}}
            <PixInput
              onchange={{this.updateValue}}
              @subLabel={{this.placeholder}}
              @value={{this.formValue}}
              required={{true}}
              aria-required={{true}}
            >
              <:label>{{this.inputLabel}}</:label>
            </PixInput>
          {{/if}}
        {{/if}}
      </div>
    </div>
  </template>
}
