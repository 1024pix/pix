import { PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
export default class ActionChip extends Component {
  <template>
    <button
      class="action-chip {{if @isCompleted 'action-chip--selected' ''}}"
      aria-label={{@title}}
      title={{@title}}
      type="button"
      {{on "click" this.triggerAction}}
      disabled={{this.isTriggering}}
      aria-disabled={{this.isTriggering}}
    >
      <PixIcon
        @name={{@icon}}
        @plainIcon={{if @isCompleted true false}}
        @ariaHidden={{true}}
        class="action-chip__icon"
      />
    </button>
  </template>
  @tracked
  isTriggering = false;

  @action
  async triggerAction() {
    if (this.args.triggerAction && !this.isTriggering) {
      this.isTriggering = true;
      await this.args.triggerAction();
    }
    this.isTriggering = false;
  }
}
