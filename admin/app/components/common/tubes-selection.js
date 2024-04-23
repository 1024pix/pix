import { A as EmberArray } from '@ember/array';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const MAX_TUBE_LEVEL = 8;

export default class TubesSelection extends Component {
  @service notifications;

  @tracked selectedFrameworkIds;

  @tracked selectedTubeIds = [];
  @tracked totalTubesCount = 0;
  @tracked areas;
  @tracked tubeLevels = {};

  constructor(...args) {
    super(...args);

    if (this.args.initialFrameworks?.length > 0) {
      this.selectedFrameworkIds = Array.from(
        new Set(
          this.args.initialFrameworks.map((area) => {
            return area.frameworkId;
          }),
        ),
      );
    } else {
      this.setDefaultFrameworks();
    }

    if (this.args.initialCappedTubes?.length > 0) {
      this.setInitialCheckedTubes();
    }
  }

  setDefaultFrameworks() {
    const pixFramework = this.args.frameworks.find((framework) => framework.name === 'Pix');
    this.selectedFrameworkIds = [pixFramework.id];
  }

  setInitialCheckedTubes() {
    this.selectedTubeIds = this.args.initialCappedTubes.map((tube) => {
      this.tubeLevels[tube.id] = tube.level;
      return tube.id;
    });
  }

  get frameworkOptions() {
    return this.args.frameworks.map((framework) => {
      return { label: framework.name, value: framework.id };
    });
  }

  get selectedFrameworks() {
    return this.args.frameworks.filter((framework) => this.selectedFrameworkIds.includes(framework.id));
  }

  get hasNoFrameworksSelected() {
    return this.selectedFrameworkIds.length === 0;
  }

  @action
  setSelectedFrameworkIds(frameworkIds) {
    this.selectedFrameworkIds = frameworkIds;
  }

  @action
  checkTube(tube) {
    if (this.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.selectedTubeIds.pushObject(tube.id);

    this._triggerOnChange();
  }

  @action
  uncheckTube(tube) {
    const index = this.selectedTubeIds.indexOf(tube.id);
    if (index === -1) {
      return;
    }
    this.selectedTubeIds.removeAt(index);

    this._triggerOnChange();
  }

  @action
  setLevelTube(tubeId, level) {
    this.tubeLevels = {
      ...this.tubeLevels,
      [tubeId]: parseInt(level),
    };

    this._triggerOnChange();
  }

  @action
  async refreshAreas() {
    const selectedFrameworksAreas = (
      await Promise.all(
        this.selectedFrameworks.map(async (framework) => {
          const frameworkAreas = await framework.areas.reload();
          return frameworkAreas.toArray();
        }),
      )
    ).flat();

    this.totalTubesCount = await this._calculateNumberOfTubes(selectedFrameworksAreas);

    this.areas = selectedFrameworksAreas.sort((area1, area2) => {
      return area1.code - area2.code;
    });

    this._triggerOnChange();
  }

  @action
  fillTubesSelectionFromFile([file]) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => this._onFileLoad(event));
    reader.readAsText(file);
  }

  _triggerOnChange() {
    const selectedTubesWithLevel = this._getSelectedTubesWithLevel();
    this.args.onChange(selectedTubesWithLevel);
  }

  get selectedTubesCount() {
    return this._selectedTubes.length;
  }

  get _selectedTubes() {
    return (
      this.areas
        ?.flatMap((area) => {
          const competences = area.competences.toArray();
          return competences.flatMap((competence) => {
            const thematics = competence.thematics.toArray();
            return thematics.flatMap((thematic) => thematic.tubes.toArray());
          });
        })
        .filter((tube) => this.selectedTubeIds.includes(tube.id)) ?? []
    );
  }

  _onFileLoad(event) {
    try {
      const data = JSON.parse(event.target.result);

      if (!Array.isArray(data)) throw new Error("Le format du fichier n'est pas reconnu.");
      if (data.length === 0) throw new Error('Le fichier ne contient aucun élément.');

      if (typeof data[0] === 'string') {
        this._loadTubesPreselection(data);
      } else if (typeof data[0] === 'object' && typeof data[0].id === 'string') {
        this._loadTargetProfile(data);
      } else {
        throw new Error("Le format du fichier n'est pas reconnu.");
      }

      this._triggerOnChange();
      this.notifications.success('Fichier bien importé.');
    } catch (e) {
      this.notifications.error(e.message);
    }
  }

  _loadTubesPreselection(tubeIds) {
    this.selectedTubeIds = EmberArray(tubeIds);
    this.tubeLevels = {};
    this.setDefaultFrameworks();
  }

  _loadTargetProfile(tubes) {
    this.selectedTubeIds = EmberArray(tubes.map(({ id }) => id));
    this.tubeLevels = Object.fromEntries(tubes.map(({ id, level }) => [id, level]));
    if (tubes[0].frameworkId) {
      this.selectedFrameworkIds = [...new Set(tubes.map(({ frameworkId }) => frameworkId))];
    } else {
      this.setDefaultFrameworks();
    }
  }

  async _calculateNumberOfTubes(areas) {
    const competences = (await Promise.all(areas.map(async (area) => await area.competences.toArray()))).flat();
    const thematics = (
      await Promise.all(competences.map(async (competence) => await competence.thematics.toArray()))
    ).flat();
    const tubes = (await Promise.all(thematics.map(async (thematic) => await thematic.tubes.toArray()))).flat();
    return tubes.length;
  }

  _getSelectedTubesWithLevel() {
    return this._selectedTubes.map((tube) => {
      const level = this.tubeLevels[tube.id] ?? MAX_TUBE_LEVEL;
      return { id: tube.id, level };
    });
  }
}
