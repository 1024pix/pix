import Component from '@glimmer/component';

export default class HabilitationTag extends Component {
  get ariaLabel() {
    const { active, label } = this.args;

    return `${active ? 'Habilité' : 'Non habilité'} pour ${label}`;
  }

  get className() {
    const { active } = this.args;

    return `${active ? '' : 'non-'}granted-habilitation-icon`;
  }

  get icon() {
    const { active } = this.args;

    return `circle-${active ? 'check' : 'xmark'}`;
  }
}
