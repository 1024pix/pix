import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';

export default class TubesSelection extends Component {
  @service notifications;

  @tracked selectedFrameworkIds;

  @tracked isDownloadModalOpened = false;
  @tracked tubesWithLevelAndSkills;
  @tracked downloadContent;

  @tracked selectedTubeIds = EmberArray();
  @tracked totalTubesCount = 0;
  @tracked areas;
  @tracked tubeLevels = {};

  constructor(...args) {
    super(...args);
    const pixFramework = this.args.frameworks.find((framework) => framework.name === 'Pix');
    this.selectedFrameworkIds = [pixFramework.id];
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
  async checkTube(tube) {
    if (this.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.selectedTubeIds.pushObject(tube.id);

    await this._triggerOnChange();
  }

  @action
  async uncheckTube(tube) {
    const index = this.selectedTubeIds.indexOf(tube.id);
    if (index === -1) {
      return;
    }
    this.selectedTubeIds.removeAt(index);

    await this._triggerOnChange();
  }

  @action
  async setLevelTube(tubeId, level) {
    this.tubeLevels[tubeId] = parseInt(level);

    await this._triggerOnChange();
  }

  @action
  async refreshAreas() {
    const selectedFrameworksAreas = (
      await Promise.all(
        this.selectedFrameworks.map(async (framework) => {
          const frameworkAreas = await framework.areas;
          return frameworkAreas.toArray();
        })
      )
    ).flat();

    this.totalTubesCount = await this._calculateNumberOfTubes(selectedFrameworksAreas);

    this.areas = selectedFrameworksAreas.sort((area1, area2) => {
      return area1.code - area2.code;
    });

    await this._triggerOnChange();
  }

  @action
  fillTubesSelectionFromFile([file]) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => this._onFileLoad(event));
    reader.readAsText(file);
  }

  async _triggerOnChange() {
    const selectedTubesWithLevelAndSkills = await this._getSelectedTubesWithLevelAndSkills();
    this.args.onChange(selectedTubesWithLevelAndSkills);
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

  async _onFileLoad(event) {
    try {
      const tubeIds = JSON.parse(event.target.result);
      if (tubeIds.length === 0) {
        throw new Error('Ce fichier ne contient aucun sujet !');
      }
      if (typeof tubeIds[0] !== 'string') {
        throw new Error("Le format du fichier n'est pas reconnu");
      }
      this.selectedTubeIds = EmberArray(tubeIds);
      // FIXME reset tubeLevels?
      this.notifications.success('Fichier bien importé.');
      await this._triggerOnChange();
    } catch (e) {
      this.notifications.error(e.message);
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

  async _getSelectedTubesWithLevelAndSkills() {
    return Promise.all(
      this._selectedTubes.map(async (tube) => {
        const skills = await tube.skills;

        const level = this.tubeLevels[tube.id] ?? 8;

        return {
          id: tube.id,
          level,
          skills: skills
            .toArray()
            .filter((skill) => skill.level <= level)
            .map((skill) => skill.id),
        };
      })
    );
  }
}
