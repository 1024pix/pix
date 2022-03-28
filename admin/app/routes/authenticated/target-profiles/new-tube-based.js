import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewRoute extends Route {
  queryParams = {
    selectedFrameworkIds: {
      refreshModel: true,
      type: 'array',
    },
  };

  @service store;

  @tracked selectedFrameworkIds = null;

  async model(params) {
    const targetProfile = this.store.createRecord('target-profile', { category: 'OTHER' });
    const frameworks = await this.store.findAll('framework');

    const areasBySelectedFrameworks =
      params.selectedFrameworkIds &&
      (await Promise.all(
        params.selectedFrameworkIds.map((selectedFrameworkId) => {
          return this.store.query('area', { frameworkId: selectedFrameworkId });
        })
      ));

    return { targetProfile, frameworks, areasBySelectedFrameworks };
  }
}
