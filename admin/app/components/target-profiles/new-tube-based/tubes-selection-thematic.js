import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TubesSelectionThematic extends Component {
  get state() {
    const checked = this.args.thematic.tubes.every((tube) => this.isTubeSelected(tube));
    if (checked) return 'checked';

    const indeterminate = this.args.thematic.tubes.any((tube) => this.isTubeSelected(tube));
    if (indeterminate) return 'indeterminate';

    return 'unchecked';
  }

  isTubeSelected(tube) {
    return this.args.tubesSelected.some((selectedTube) => selectedTube.id === tube.id);
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
