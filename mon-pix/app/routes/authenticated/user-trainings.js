import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class UserTrainingsRoute extends Route {
  @service currentUser;
  @service store;
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  async model(params) {
    const user = this.currentUser.user;
    const trainings = await this.store.query(
      `training`,
      {
        page: {
          number: params.pageNumber,
          size: params.pageSize || 8,
        },
        userId: user.id,
      },
      { reload: true },
    );

    return { trainings };
  }
}
