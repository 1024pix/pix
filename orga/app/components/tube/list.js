import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class TubeList extends Component {
  @tracked selectedTubeIds = [];
  @service dayjs;

  @action
  selectThematic(thematic) {
    thematic.tubes.forEach((tube) => {
      this.selectTube(tube);
    });
  }

  @action
  unselectThematic(thematic) {
    thematic.tubes.forEach((tube) => {
      this.unselectTube(tube);
    });
  }

  @action
  selectTube(tube) {
    if (this.isTubeSelected(tube)) return;
    this.selectedTubeIds.pushObject(tube.id);
  }

  @action
  unselectTube(tube) {
    const index = this.selectedTubeIds.indexOf(tube.id);
    if (index === -1) return;
    this.selectedTubeIds.removeAt(index);
  }

  getThematicState = (thematic) => {
    let every = true;
    let some = false;
    thematic.tubes.forEach((tube) => {
      if (this.isTubeSelected(tube)) {
        some = true;
      } else {
        every = false;
      }
    });
    return every ? 'checked' : some ? 'indeterminate' : 'unchecked';
  };

  isTubeSelected = (tube) => {
    return this.selectedTubeIds.includes(tube.id);
  };

  get sortedAreas() {
    return this.args.frameworks
      .map((framework) => framework.sortedAreas)
      .flat()
      .sort((a, b) => {
        return a.code.localeCompare(b.code);
      });
  }

  get haveNoTubeSelected() {
    return this.selectedTubeIds.length === 0;
  }

  get numberOfTubesSelected() {
    return this.selectedTubeIds.length;
  }

  get file() {
    const selectedTubes = this.args.frameworks.slice().flatMap((framework) => {
      return framework.sortedAreas.slice().flatMap((area) => {
        return area.sortedCompetences.slice().flatMap((competence) => {
          return competence.sortedThematics.slice().flatMap((thematic) => {
            return thematic.sortedTubes
              .filter((tube) => this.isTubeSelected(tube))
              .map((tube) => ({
                id: tube.id,
                frameworkId: framework.id,
              }));
          });
        });
      });
    });
    const json = JSON.stringify(selectedTubes);
    return new Blob([json], { type: 'application/json' });
  }

  get fileSize() {
    return (this.file.size / 1024).toFixed(2);
  }

  get formattedCurrentDate() {
    return this.dayjs.self().format('YYYY-MM-DD-HHmm');
  }

  get downloadURL() {
    return URL.createObjectURL(this.file);
  }
}
