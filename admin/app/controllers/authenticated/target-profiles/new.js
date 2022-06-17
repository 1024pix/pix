import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { A as EmberArray } from '@ember/array';

import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  @service notifications;
  @service store;
  @service router;

  @tracked isSaving = false;
  @tracked selectedTubeIds = EmberArray();
  @tracked totalTubesCount = 0;
  @tracked areas;
  tubeLevels = {};

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

  @action
  goBackToTargetProfileList() {
    this.store.deleteRecord(this.model.targetProfile);

    this.router.transitionTo('authenticated.target-profiles.list');
  }

  @action
  fillTubeSelectionFromFile([file]) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load', (event) => this._onFileLoad(event));
  }

  _onFileLoad(event) {
    try {
      const tubeIds = JSON.parse(event.target.result);
      if (tubeIds.length === 0) {
        throw new Error('Ce fichier ne contient aucun sujet !');
      }
      if (typeof tubeIds[0] !== 'string') {
        throw new Error("Le format du fichier n'est pas reconnu");
      }
      this.selectedTubeIds = EmberArray(tubeIds);
      this.notifications.success('Fichier bien importé.');
    } catch (e) {
      this.notifications.error(e.message);
    }
  }

  @action
  async createTargetProfile(event) {
    event.preventDefault();
    const targetProfile = this.model.targetProfile;

    const { skillIds, templateTubes } = await this.buildSkillsAndTubesBeforeCreateTargetProfile();
    targetProfile.skillIds = skillIds;
    targetProfile.templateTubes = templateTubes;

    if (targetProfile.templateTubes.length === 0) {
      this.notifications.error('Aucun sujets sélectionnés !');
      return;
    }

    try {
      this.isSaving = true;
      await targetProfile.save();

      this.notifications.success('Le profil cible a été créé avec succès.');
      this.router.transitionTo('authenticated.target-profiles.target-profile', targetProfile.id);
    } catch (error) {
      this._handleResponseError(error);
    } finally {
      this.isSaving = false;
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    errors.forEach((error) => {
      if (['404', '412', '422'].includes(error.status)) {
        return this.notifications.error(error.detail);
      }
      return this.notifications.error('Une erreur est survenue.');
    });
  }

  async buildSkillsAndTubesBeforeCreateTargetProfile() {
    const tubesWithLevelAndSkills = await this.getSelectedTubesWithLevelAndSkills();
    const skillIds = tubesWithLevelAndSkills.flatMap((tubeWithLevelAndSkills) => tubeWithLevelAndSkills.skills);
    const templateTubes = tubesWithLevelAndSkills.map(({ id, level }) => ({
      id,
      level,
    }));

    return {
      skillIds,
      templateTubes,
    };
  }

  async getSelectedTubesWithLevelAndSkills() {
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

  @action
  async refreshAreas(selectedFrameworks) {
    const selectedFrameworksAreas = (
      await Promise.all(
        selectedFrameworks.map(async (framework) => {
          const frameworkAreas = await framework.areas;
          return frameworkAreas.toArray();
        })
      )
    ).flat();

    this.totalTubesCount = await this._calculateNumberOfTubes(selectedFrameworksAreas);

    this.areas = selectedFrameworksAreas.sort((area1, area2) => {
      return area1.code - area2.code;
    });
  }

  async _calculateNumberOfTubes(areas) {
    const competences = (await Promise.all(areas.map(async (area) => await area.competences.toArray()))).flat();
    const thematics = (
      await Promise.all(competences.map(async (competence) => await competence.thematics.toArray()))
    ).flat();
    const tubes = (await Promise.all(thematics.map(async (thematic) => await thematic.tubes.toArray()))).flat();
    return tubes.length;
  }
}
