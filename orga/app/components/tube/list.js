import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import Component from '@glimmer/component';

export default class TubeList extends Component {
  @tracked tubesSelected = A();

  get haveNoTubeSelected() {
    return this.tubesSelected.length === 0;
  }

  get file() {
    const json = JSON.stringify(this.tubesSelected);
    return new Blob([json], { type: 'application/json' });
  }

  get fileSize() {
    return (this.file.size / 1024).toFixed(2);
  }

  get downloadURL() {
    return URL.createObjectURL(this.file);
  }

  get sortedAreas() {
    return this.args.areas.sortBy('code');
  }

  @action
  toggleInput(event) {
    const checkbox = event.currentTarget.querySelector('input');
    if (event.target.nodeName === 'TD') {
      checkbox.checked = !checkbox.checked;
      const evt = document.createEvent('HTMLEvents');
      evt.initEvent('input', false, true);
      checkbox.dispatchEvent(evt);
    }
  }

  @action
  updateSelectedTubes(tubeId, event) {
    const el = event.currentTarget;
    if (el.checked) {
      this.tubesSelected.pushObject(tubeId);
    } else {
      this.tubesSelected.removeObject(tubeId);
    }
  }
}
