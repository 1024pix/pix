import Route from '@ember/routing/route';
import { service } from '@ember/service';

const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 50;

export default class ListRoute extends Route {
  @service store;

  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    organizationSort: { refreshModel: true },
    birthdateSort: { refreshModel: true },
    updatedAtSort: { refreshModel: true },
  };

  async model(params) {
    try {
      const organizationLearners = await this.store.query('admin-organization-learner', {
        page: {
          number: params.pageNumber ?? DEFAULT_PAGE_NUMBER,
          size: params.pageSize ?? DEFAULT_PAGE_SIZE,
        },
        sort: {
          organizationSort: params.organizationSort,
          birthdateSort: params.birthdateSort,
          updatedAtSort: params.updatedAtSort,
        },
      });
      return organizationLearners;
    } catch {
      return [];
    }
  }
}
