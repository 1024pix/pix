import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { styleToolkit } from '../utils/layout';

export default class SchoolRoute extends Route {
  @service store;
  @service currentLearner;
  @service router;

  async beforeModel() {
    this.currentLearner.remove();
  }

  @action
  refreshSchool() {
    this.refresh();
  }

  async model(_params, transition) {
    try {
      const school = await this.store.queryRecord('school', {
        code: transition.to.parent.params.code,
      });
      const divisions = [...new Set(school.organizationLearners.map((learner) => learner.division))];
      return {
        code: school.code,
        name: school.name,
        organizationLearners: school.organizationLearners,
        divisions: divisions.sort(),
      };
    } catch {
      return {
        error: true,
      };
    }
  }

  afterModel(_resolvedModel, _transition) {
    if (_resolvedModel.error) {
      styleToolkit.backgroundBlob.reset();
    } else {
      styleToolkit.backgroundBlob.apply('/images/background-blob.svg');
    }
  }
}
