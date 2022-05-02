import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GenerateTargetProfileFromTubeBased extends Component {
  @service router;
  @service notifications;

  @tracked selectedFrameworkIds;

  constructor(...args) {
    super(...args);
    const pixFramework = this.args.frameworks.find((framework) => framework.name === 'Pix');
    if (pixFramework) {
      this.selectedFrameworkIds = [pixFramework.id];
    }
  }

  get frameworkOptions() {
    return this.args.frameworks.map((framework) => {
      return { label: framework.name, value: framework.id };
    });
  }

  get selectedFrameworks() {
    return this.args.frameworks.filter((framework) => this.selectedFrameworkIds.includes(framework.id));
  }

  @action
  setSelectedFrameworkIds(frameworkIds) {
    this.selectedFrameworkIds = frameworkIds;
  }
}
