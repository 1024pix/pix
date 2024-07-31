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
}
