import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';
import Component from '@glimmer/component';

export default class TubesSelection extends Component {
  @tracked areas;
  @tracked tubesSelected = EmberArray();
  tubeLevels = {};

  get haveNoTubeSelected() {
    return this.tubesSelected.length === 0;
  }

  get numberOfTubesSelected() {
    return this.tubesSelected.length;
  }

  @action
  async refreshAreas() {
    const selectedFrameworksAreas = await Promise.all(
      this.args.selectedFrameworks.map(async (framework) => {
        const frameworkAreas = await framework.areas;
        return frameworkAreas.toArray();
      })
    );

    this.areas = selectedFrameworksAreas.flat().sort((area1, area2) => {
      return area1.code - area2.code;
    });
  }

  @action
  checkTube(tube) {
    if (this.tubesSelected.includes(tube.id)) {
      return;
    }
    this.tubesSelected.pushObject(tube.id);
  }

  @action
  uncheckTube(tube) {
    const index = this.tubesSelected.indexOf(tube.id);
    if (index === -1) {
      return;
    }
    this.tubesSelected.removeAt(index);
  }

  @action
  setLevelTube(tubeId, level) {
    this.tubeLevels[tubeId] = level;
  }

  get hasNoFrameworksSelected() {
    return this.args.selectedFrameworks.length === 0;
  }
}
