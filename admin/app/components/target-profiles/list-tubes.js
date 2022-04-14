import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';
import Component from '@glimmer/component';

export default class ListTubes extends Component {
  @tracked areas;
  @tracked tubesSelected = EmberArray();

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
      const level = this._getSelectedTubeLevel(tubeId);
      this.tubesSelected.pushObject({ id: tubeId, level });
    } else {
      this.tubesSelected = this.tubesSelected.filter((tubeSelected) => {
        return tubeSelected.id !== tubeId;
      });
    }
  }

  _getSelectedTubeLevel(tubeId) {
    const selectLevel = document.getElementById(`select-level-tube-${tubeId}`);
    return selectLevel.value;
  }

  @action
  updateSelectedThematic(thematicId, event) {
    const thematic = event.currentTarget;
    const tubes = document.querySelectorAll(`[data-thematic="${thematicId}"]`);
    const uniqueTubesSelected = new Set(this.tubesSelected.map(JSON.stringify));
    this._toggleCheckboxCompetenceByElement(thematic);

    if (thematic.checked) {
      for (let i = 0; i < tubes.length; i++) {
        const tubeId = tubes[i].getAttribute('data-tube');
        tubes[i].checked = true;
        uniqueTubesSelected.add(JSON.stringify({ id: tubeId, level: this._getSelectedTubeLevel(tubeId) }));
      }
    } else {
      for (let i = 0; i < tubes.length; i++) {
        const tubeId = tubes[i].getAttribute('data-tube');
        tubes[i].checked = false;
        uniqueTubesSelected.delete(JSON.stringify({ id: tubeId, level: this._getSelectedTubeLevel(tubeId) }));
      }
    }

    this.tubesSelected = A([...new Set(uniqueTubesSelected)].map(JSON.parse));
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
  setLevelTube(tubeId, level) {
    this.tubesSelected.map((tubeSelected) => {
      if (tubeSelected.id === tubeId) {
        tubeSelected.level = level;
      }
      return tubeSelected;
    });
  }
}
