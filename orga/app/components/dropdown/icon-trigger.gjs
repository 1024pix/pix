import { PixIconButton } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import DropdownContent from './content';

export default class IconTrigger extends Component {
  @tracked display = false;

  @action
  toggle(event) {
    event.stopPropagation();
    this.display = !this.display;
  }

  @action
  close() {
    this.display = false;
  }

  <template>
    <div class="dropdown" ...attributes>
      <PixIconButton
        @iconName={{@icon}}
        @ariaLabel={{@ariaLabel}}
        class={{@dropdownButtonClass}}
        @triggerAction={{this.toggle}}
        @size="small"
        @color="dark-grey"
      />
      <DropdownContent @display={{this.display}} @close={{this.close}} class="{{@dropdownContentClass}}">
        {{yield this.close}}
      </DropdownContent>
    </div>
  </template>
}
