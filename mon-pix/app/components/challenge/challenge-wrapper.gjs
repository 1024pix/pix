import { PixIcon } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class ChallengeWrapper extends Component {
  get classList() {
    const list = ['challenge-wrapper'];
    if (this.args.hasAnswer) list.push(' challenge-wrapper--locked');
    if (this.args.isCertification) list.push('challenge-wrapper--certif');

    return list.join(' ');
  }

  <template>
    <div class={{this.classList}}>
      {{yield}}

      {{#if @hasAnswer}}
        <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} class="challenge-wrapper__lock-icon" />
      {{/if}}
    </div>
  </template>
}
