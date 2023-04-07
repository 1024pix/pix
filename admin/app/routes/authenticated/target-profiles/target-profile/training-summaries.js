import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import isEmpty from 'lodash/isEmpty';

export default class TargetProfileTrainingsRoute extends Route {
  @service accessControl;
  @service notifications;
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(params) {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    let trainingSummaries;

    try {
      trainingSummaries = await this.store.query('training-summary', {
        targetProfileId: targetProfile.id,
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      });
    } catch (errorResponse) {
      if (!isEmpty(errorResponse)) {
        errorResponse.errors.forEach((error) => this.notifications.error(error.detail));
      }
      return [];
    }
    return { targetProfile, trainingSummaries };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('pageNumber', null);
    }
  }
}
