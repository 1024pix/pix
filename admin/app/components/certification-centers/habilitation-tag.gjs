import { PixIcon } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class HabilitationTag extends Component {
  get className() {
    return `certification-center-information-display__habilitations-list--${this.args.active ? 'enabled' : 'disabled'}`;
  }

  get icon() {
    const { active } = this.args;

    return `${active ? 'checkCircle' : 'cancel'}`;
  }

  <template>
    <li aria-label={{@arialabel}} class={{this.className}}>
      <PixIcon @name={{this.icon}} />
      {{@label}}
    </li>
  </template>
}
