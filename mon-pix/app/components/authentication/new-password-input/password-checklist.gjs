import Component from '@glimmer/component';
import { t } from 'ember-intl';

import PasswordRule from './password-rule';

export default class PasswordChecklist extends Component {
  get displayedRules() {
    const { rules = [], value } = this.args;

    return rules.map((rule) => ({
      ...rule,
      isValid: Boolean(value) && rule.validate(value),
    }));
  }

  get rulesCount() {
    const { rules = [] } = this.args;
    return rules.length;
  }

  get rulesCompleted() {
    const { rules = [], value } = this.args;
    const invalidRulesCount = this.displayedRules.filter((rule) => !rule.isValid).length;

    return !value ? 0 : rules.length - invalidRulesCount;
  }

  <template>
    <div class="password-checklist" ...attributes>
      <label class="password-checklist__instructions" for="checklist">
        {{t "components.authentication.new-password-input.instructions-label"}}
      </label>
      <ul id="checklist">
        {{#each this.displayedRules as |rule|}}
          <PasswordRule @description={{t rule.i18nKey}} @isValid={{rule.isValid}} />
        {{/each}}
      </ul>
      <p class="sr-only" aria-atomic="true" aria-relevant="all" aria-live="polite">
        {{t
          "components.authentication.new-password-input.completed-message"
          rulesCompleted=this.rulesCompleted
          rulesCount=this.rulesCount
        }}
      </p>
    </div>
  </template>
}
