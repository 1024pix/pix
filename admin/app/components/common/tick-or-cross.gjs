import { PixIcon } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class TickOrCross extends Component {
  get icon() {
    return this.args.isTrue ? 'check' : 'close';
  }

  get class() {
    return this.args.isTrue ? 'tick-or-cross--valid' : 'tick-or-cross--invalid';
  }
  <template><PixIcon @name={{this.icon}} class="tick-or-cross {{this.class}}" /></template>
}
