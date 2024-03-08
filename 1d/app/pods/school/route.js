import Route from '@ember/routing/route';
import { service } from '@ember/service';

import { styleToolkit } from '../../utils/layout';

export default class SchoolRoute extends Route {
  @service store;
  @service currentLearner;

  async beforeModel() {
    this.currentLearner.remove();
    styleToolkit.backgroundBlob.apply('/images/background-blob.svg');
  }

  async model(_params, transition) {
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
  }
}
