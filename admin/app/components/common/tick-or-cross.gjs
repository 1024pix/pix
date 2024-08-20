import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';

export default class TickOrCross extends Component {
  get icon() {
    return this.args.isTrue ? 'check' : 'times';
  }

  get class() {
    return this.args.isTrue ? 'tick-or-cross--valid' : 'tick-or-cross--invalid';
  }
  <template><FaIcon @icon={{this.icon}} class="tick-or-cross {{this.class}}" /></template>
}
