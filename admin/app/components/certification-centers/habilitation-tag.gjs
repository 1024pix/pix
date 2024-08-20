import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';

export default class HabilitationTag extends Component {
  get className() {
    const { active } = this.args;

    return `${active ? '' : 'non-'}granted-habilitation-icon`;
  }

  get icon() {
    const { active } = this.args;

    return `circle-${active ? 'check' : 'xmark'}`;
  }

  <template>
    <li aria-label={{@arialabel}}>
      <FaIcon class={{this.className}} @icon={{this.icon}} />
      {{@label}}
    </li>
  </template>
}
