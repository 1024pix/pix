import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default class PaginationControl extends Component {
  @service router;

  pagination = null;
  paginationLink = null;

  @computed('pagination')
  get nextPage() {
    return Math.min(this.pagination.page + 1, this.pagination.pageCount);
  }

  @computed('pagination')
  get previousPage() {
    return Math.max(this.pagination.page - 1, 1);
  }

  @action
  changePageSize(event) {
    this.router.replaceWith({ queryParams: { pageSize: event.target.value, pageNumber: 1 } });
  }
}
