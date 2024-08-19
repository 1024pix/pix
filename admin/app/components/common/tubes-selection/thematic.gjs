import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

import { isTubeSelected } from '../../../helpers/is-tube-selected';

export default class Thematic extends Component {
  get state() {
    const checked = this.args.thematic
      .hasMany('tubes')
      .value()
      .any((tube) => isTubeSelected(this.args.selectedTubeIds, tube));

    return checked;
  }

  get isIndeterminate() {
    const isEverythingChecked = this.args.thematic
      .hasMany('tubes')
      .value()
      .every((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
    return this.state && !isEverythingChecked;
  }

  @action
  onChange(event) {
    if (event.target.checked) {
      this.check();
    } else {
      this.uncheck();
    }
  }

  check() {
    this.args.thematic
      .hasMany('tubes')
      .value()
      .forEach((tube) => {
        this.args.checkTube(tube);
      });
  }

  uncheck() {
    this.args.thematic
      .hasMany('tubes')
      .value()
      .forEach((tube) => {
        this.args.uncheckTube(tube);
      });
  }

  <template>
    <th rowspan={{@thematic.tubes.length}}>
      <PixCheckbox
        @id="thematic-{{@thematic.id}}"
        @checked={{this.state}}
        {{on "change" this.onChange}}
        @isIndeterminate={{this.isIndeterminate}}
      >
        <:label>{{@thematic.name}}</:label>
      </PixCheckbox>
    </th>
  </template>
}
