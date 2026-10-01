import { PixCheckbox } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Thematic extends Component {
  get isIndeterminate() {
    return this.state === 'indeterminate';
  }

  get state() {
    return this.args.getThematicState(this.args.thematic);
  }

  get isChecked() {
    return ['checked', 'indeterminate'].includes(this.state);
  }

  @action
  toggleThematic(event) {
    if (event.target.checked) {
      this.args.selectThematic(this.args.thematic);
    } else {
      this.args.unselectThematic(this.args.thematic);
    }
  }

  <template>
    <th scope="row" rowspan={{@thematic.tubes.length}}>
      <PixCheckbox
        @id="thematic-{{@thematic.id}}"
        @checked={{this.isChecked}}
        @isIndeterminate={{this.isIndeterminate}}
        {{on "click" this.toggleThematic}}
      >
        <:label>{{@thematic.name}}</:label>
      </PixCheckbox>
    </th>
  </template>
}
