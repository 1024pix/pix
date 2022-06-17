import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TubesSelection extends Component {
  @service notifications;

  @tracked selectedFrameworkIds;

  @tracked isDownloadModalOpened = false;
  @tracked tubesWithLevelAndSkills;
  @tracked downloadContent;

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
  checkTube(tube) {
    if (this.args.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.args.selectedTubeIds.pushObject(tube.id);
  }

  @action
  uncheckTube(tube) {
    const index = this.args.selectedTubeIds.indexOf(tube.id);
    if (index === -1) {
      return;
    }
    this.args.selectedTubeIds.removeAt(index);
  }

  @action
  setLevelTube(tubeId, level) {
    this.args.tubeLevels[tubeId] = parseInt(level);
  }
}
