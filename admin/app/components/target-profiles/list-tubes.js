import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';
import Component from '@glimmer/component';

export default class ListTubes extends Component {
  levelOptions = [
    {
      value: 1,
      label: '1',
    },
    {
      value: 2,
      label: '2',
    },
    {
      value: 3,
      label: '3',
    },
    {
      value: 4,
      label: '4',
    },
    {
      value: 5,
      label: '5',
    },
    {
      value: 6,
      label: '6',
    },
    {
      value: 7,
      label: '7',
    },
    {
      value: 8,
      label: '8',
    },
  ];
  @tracked tubesSelected = EmberArray();

  get haveNoTubeSelected() {
    return this.tubesSelected.length === 0;
  }

  get numberOfTubesSelected() {
    return this.tubesSelected.length;
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
      thematic.checked = false;
    } else {
      thematic.indeterminate = false;
      thematic.checked = false;
    }
  }

  _toggleCheckboxCompetenceByElement(element) {
    let competenceId;
    if (element.hasAttribute('data-competence')) {
      competenceId = element.getAttribute('data-competence');
    } else {
      competenceId = element.getAttribute('data-competenceId');
    }
    const competence = document.getElementById(`competence-${competenceId}`);
    const thematics = document.querySelectorAll(`[data-competence="${competenceId}"]`);

    if (Array.from(thematics).every((element) => element.checked)) {
      competence.indeterminate = false;
      competence.checked = true;
    } else if (Array.from(thematics).some((element) => element.checked)) {
      competence.indeterminate = true;
      competence.checked = false;
    } else if (Array.from(thematics).some((element) => element.indeterminate)) {
      competence.indeterminate = true;
      competence.checked = false;
    } else {
      competence.indeterminate = false;
      competence.checked = false;
    }
  }

  @action
  updateSelectedTubes(tubeId, event) {
    const tube = event.currentTarget;
    this._toggleCheckboxThematicByTubes(tube);
    this._toggleCheckboxCompetenceByElement(tube);

    if (tube.checked) {
      this.tubesSelected.pushObject(tubeId);
    } else {
      this.tubesSelected.removeObject(tubeId);
    }
  }

  @action
  updateSelectedThematic(thematicId, event) {
    const thematic = event.currentTarget;
    const tubes = document.querySelectorAll(`[data-thematic="${thematicId}"]`);
    const uniqueTubesSelected = new Set(this.tubesSelected);
    this._toggleCheckboxCompetenceByElement(thematic);

    if (thematic.checked) {
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

  @action
  updateSelectedCompetence(competenceId, event) {
    const el = event.currentTarget;
    const thematics = document.querySelectorAll(`[data-competence="${competenceId}"]`);

    if (el.checked) {
      for (let i = 0; i < thematics.length; i++) {
        const thematicId = thematics[i].getAttribute('data-thematicId');
        thematics[i].checked = true;
        thematics[i].indeterminate = false;
        event = { currentTarget: thematics[i] };
        this.updateSelectedThematic(thematicId, event);
      }
    } else {
      for (let i = 0; i < thematics.length; i++) {
        const thematicId = thematics[i].getAttribute('data-thematicId');
        thematics[i].checked = false;
        thematics[i].indeterminate = false;
        event = { currentTarget: thematics[i] };
        this.updateSelectedThematic(thematicId, event);
      }
    }
  }

  @action
  setLevelTube(tubeId) {
    console.log(tubeId);
  }
}
