import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A as EmberArray } from '@ember/array';

export default class GenerateTargetProfileFromTubeBased extends Component {
  @service router;
  @service notifications;

  @tracked selectedFrameworkIds;
  @tracked areas;
  @tracked selectedTubeIds = EmberArray();
  tubeLevels = {};

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
  async refreshAreas() {
    const selectedFrameworksAreas = await Promise.all(
      this.selectedFrameworks.map(async (framework) => {
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
    if (this.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.selectedTubeIds.pushObject(tube.id);
  }

  @action
  uncheckTube(tube) {
    const index = this.selectedTubeIds.indexOf(tube.id);
    if (index === -1) {
      return;
    }
    this.selectedTubeIds.removeAt(index);
  }

  @action
  setLevelTube(tubeId, level) {
    this.tubeLevels[tubeId] = level;
  }

  @action
  goBackToTargetProfileList() {
    this.router.transitionTo('authenticated.target-profiles.list');
  }
}
