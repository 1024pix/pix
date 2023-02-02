import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class TubeList extends Component {
  @tracked selectedTubeIds = A();

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

  get haveNoTubeSelected() {
    return this.selectedTubeIds.length === 0;
  }

  get numberOfTubesSelected() {
    return this.selectedTubeIds.length;
  }

  get file() {
    const json = JSON.stringify(this.selectedTubeIds);
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

  get sortedAreas() {
    return this.args.areas.sortBy('code');
  }
}
