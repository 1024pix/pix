import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';

const RULE_STYLES = {
  VALID: {
    iconClass: 'circle-check',
    listItemClass: 'password-rule',
  },
  INVALID: {
    iconClass: 'circle-xmark',
    listItemClass: 'password-rule password-rule--error',
  },
};

export default class PasswordRule extends Component {
  get classes() {
    return this.args.isValid ? RULE_STYLES.VALID : RULE_STYLES.INVALID;
  }

  <template>
    <li class="{{this.classes.listItemClass}}" aria-label="{{@description}}.">
      <FaIcon @icon="{{this.classes.iconClass}}" />
      <p aria-live="polite"> {{@description}} </p>
    </li>
  </template>
}
