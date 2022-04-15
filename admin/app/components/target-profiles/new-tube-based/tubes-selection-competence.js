import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TubesSelectionCompetence extends Component {
  get state() {
    const checked = this.args.competence.thematics.every((thematic) => this.isThematicSelected(thematic));
    if (checked) return 'checked';

    const indeterminate = this.args.competence.thematics.any((thematic) => {
      return thematic.tubes.any((tube) => this.isTubeSelected(tube));
    });

    if (indeterminate) return 'indeterminate';

    return 'unchecked';
  }

  isThematicSelected(thematic) {
    return thematic.tubes.every((tube) => this.isTubeSelected(tube));
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
