import Component from '@glimmer/component';
import { t } from 'ember-intl';

import PasswordRule from './password-rule';

export default class PasswordChecklist extends Component {
  get rules() {
    const { rules, value, errors } = this.args;
    return rules.map((rule) => ({
      ...rule,
      isValid: Boolean(value) && !errors?.includes(rule.key),
    }));
  }

  get rulesCount() {
    const { rules } = this.args;
    return rules.length;
  }

  get rulesCompleted() {
    const { rules, value, errors } = this.args;
    return !value ? 0 : rules.length - errors?.length;
  }

  <template>
    <div class="password-checklist" ...attributes>
      <label class="password-checklist__instructions" for="checklist">
        {{t "components.authentication.password-input.instructions-label"}}
      </label>
      <ul id="checklist">
        {{#each this.rules as |rule|}}
          <PasswordRule @description={{rule.description}} @isValid={{rule.isValid}} />
        {{/each}}
      </ul>
      <p class="sr-only" aria-atomic="true" aria-relevant="all" aria-live="polite">
        {{t
          "components.authentication.password-input.rules.completed-message"
          rulesCompleted=this.rulesCompleted
          rulesCount=this.rulesCount
        }}
      </p>
    </div>
  </template>
}
