import { action } from '@ember/object';
import Component from '@glimmer/component';

import { isTubeSelected } from '../../../helpers/is-tube-selected';

export default class Competence extends Component {
  get state() {
    const checked = this.args.competence
      .hasMany('thematics')
      .value()
      .every((thematic) => this.isThematicSelected(thematic));
    if (checked) return 'checked';

    const indeterminate = this.args.competence
      .hasMany('thematics')
      .value()
      .any((thematic) => {
        return thematic
          .hasMany('tubes')
          .value()
          .any((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
      });

    if (indeterminate) return 'indeterminate';

    return 'unchecked';
  }

  isThematicSelected(thematic) {
    return thematic
      .hasMany('tubes')
      .value()
      .every((tube) => isTubeSelected(this.args.selectedTubeIds, tube));
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
    this.args.competence
      .hasMany('thematics')
      .value()
      .forEach((thematic) => {
        thematic
          .hasMany('tubes')
          .value()
          .forEach((tube) => {
            this.args.checkTube(tube);
          });
      });
  }

  uncheck() {
    this.args.competence
      .hasMany('thematics')
      .value()
      .forEach((thematic) => {
        thematic
          .hasMany('tubes')
          .value()
          .forEach((tube) => {
            this.args.uncheckTube(tube);
          });
      });
  }
}
