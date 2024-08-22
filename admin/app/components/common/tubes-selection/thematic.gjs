import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class Thematic extends Component {
  get thematicTubes() {
    return this.args.thematic.hasMany('tubes').value();
  }

  get selectedTubeIds() {
    return this.args.selectedTubeIds;
  }

  get isChecked() {
    return this.thematicTubes.any(({ id }) => this.selectedTubeIds.includes(id));
  }

  get isIndeterminate() {
    return this.thematicTubes.some(({ id }) => !this.selectedTubeIds.includes(id));
  }

  @action
  onChange(event) {
    const { checked } = event.target;
    if (checked) {
      this.checkAllTubes();
    } else {
      this.uncheckAllTubes();
    }
  }

  checkAllTubes() {
    this.thematicTubes.forEach((tube) => {
      this.args.checkTube(tube);
    });
  }

  uncheckAllTubes() {
    this.thematicTubes.forEach((tube) => {
      this.args.uncheckTube(tube);
    });
  }

  <template>
    <th rowspan={{@thematic.tubes.length}}>
      <PixCheckbox
        @id="thematic-{{@thematic.id}}"
        @checked={{this.isChecked}}
        {{on "change" this.onChange}}
        @isIndeterminate={{this.isIndeterminate}}
      >
        <:label>{{@thematic.name}}</:label>
      </PixCheckbox>
    </th>
  </template>
}
