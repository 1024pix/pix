import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import Component from '@glimmer/component';

export default class HabilitationTag extends Component {
  get className() {
    return `habilitation-icon habilitation-icon--${this.args.active ? '' : 'non-'}granted`;
  }

  get icon() {
    const { active } = this.args;

    return `${active ? 'checkCircle' : 'cancel'}`;
  }

  <template>
    <li aria-label={{@arialabel}}>
      <PixIcon class={{this.className}} @name={{this.icon}} @plainIcon={{true}} />
      {{@label}}
    </li>
  </template>
}
