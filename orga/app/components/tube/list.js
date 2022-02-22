import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import moment from 'moment';
import Component from '@glimmer/component';

export default class TubeList extends Component {
  @tracked tubesSelected = A();

  get haveNoTubeSelected() {
    return this.tubesSelected.length === 0;
  }

  get numberOfTubesSelected() {
    return this.tubesSelected.length;
  }

  get file() {
    const json = JSON.stringify(this.tubesSelected);
    return new Blob([json], { type: 'application/json' });
  }

  get fileSize() {
    return (this.file.size / 1024).toFixed(2);
  }

  get formattedCurrentDate() {
    return moment().format('YYYY-MM-DD-HHmm');
  }

  get downloadURL() {
    return URL.createObjectURL(this.file);
  }

  get sortedAreas() {
    return this.args.areas.sortBy('code');
  }

  @action
  toggleTubeInput(event) {
    const checkbox = event.currentTarget.querySelector('[data-tube]');
    if (event.target.nodeName === 'TD') {
      checkbox.checked = !checkbox.checked;
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('input', false, true);
      checkbox.dispatchEvent(evt);
    }
  }

  @action
  toggleThematicInput(event) {
    const checkbox = event.currentTarget.querySelector('input');
    if (event.target.nodeName === 'TH') {
      checkbox.checked = !checkbox.checked;
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('input', false, true);
      checkbox.dispatchEvent(evt);
    }
  }

  _toggleCheckboxThematicByTubes(tube) {
    const thematicId = tube.getAttribute('data-thematic');
    const thematic = document.getElementById(`thematic-${thematicId}`);
    const tubes = document.querySelectorAll(`[data-thematic="${thematicId}"]`);

    if (Array.from(tubes).every((element) => element.checked)) {
      thematic.indeterminate = false;
      thematic.checked = true;
    } else if (Array.from(tubes).some((element) => element.checked)) {
      thematic.indeterminate = true;
    } else {
      thematic.indeterminate = false;
      thematic.checked = false;
    }
  }

  @action
  updateSelectedTubes(tubeId, event) {
    const tube = event.currentTarget;
    this._toggleCheckboxThematicByTubes(tube);
    if (tube.checked) {
      this.tubesSelected.pushObject(tubeId);
    } else {
      this.tubesSelected.removeObject(tubeId);
    }
  }

  @action
  updateSelectedThematics(thematicId, event) {
    const el = event.currentTarget;
    const tubes = document.querySelectorAll(`[data-thematic="${thematicId}"]`);
    const uniqueTubesSelected = new Set(this.tubesSelected);

    if (el.checked) {
      for (let i = 0; i < tubes.length; i++) {
        const tubeId = tubes[i].getAttribute('data-tube');
        tubes[i].checked = true;
        uniqueTubesSelected.add(tubeId);
      }
    } else {
      for (let i = 0; i < tubes.length; i++) {
        const tubeId = tubes[i].getAttribute('data-tube');
        tubes[i].checked = false;
        uniqueTubesSelected.delete(tubeId);
      }
    }

    this.tubesSelected = A([...new Set(uniqueTubesSelected)]);
  }
}
