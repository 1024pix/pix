import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isTubeSelected } from '../../../helpers/is-tube-selected';

export default class Thematic extends Component {
  get state() {
    const checked = this.args.thematic.tubes.every((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
    if (checked) return 'checked';

    const indeterminate = this.args.thematic.tubes.any((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
    if (indeterminate) return 'indeterminate';

    return 'unchecked';
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
    this.args.thematic.tubes.forEach((tube) => {
      this.args.checkTube(tube);
    });
  }

  uncheck() {
    this.args.thematic.tubes.forEach((tube) => {
      this.args.uncheckTube(tube);
    });
  }
}
