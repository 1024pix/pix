import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isTubeSelected } from '../../../helpers/is-tube-selected';

export default class Competence extends Component {
  get state() {
    const checked = this.args.competence.thematics.every((thematic) => this.isThematicSelected(thematic));
    if (checked) return 'checked';

    const indeterminate = this.args.competence.thematics.any((thematic) => {
      return thematic.tubes.any((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
    });

    if (indeterminate) return 'indeterminate';

    return 'unchecked';
  }

  isThematicSelected(thematic) {
    return thematic.tubes.every((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
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
    this.args.competence.thematics.forEach((thematic) => {
      thematic.tubes.forEach((tube) => {
        this.args.checkTube(tube);
      });
    });
  }

  uncheck() {
    this.args.competence.thematics.forEach((thematic) => {
      thematic.tubes.forEach((tube) => {
        this.args.uncheckTube(tube);
      });
    });
  }
}
