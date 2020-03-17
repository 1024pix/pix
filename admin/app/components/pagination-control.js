import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class PaginationControl extends Component {

  @service router;

  get nextPage() {
    return Math.min(this.args.pagination.page + 1, this.args.pagination.pageCount);
  }

  get previousPage() {
    return Math.max(this.args.pagination.page - 1, 1);
  }

  @action
  changePageSize(pageSize) {
    this.router.transitionTo({ queryParams: { pageSize, pageNumber: 1 } });
  }
}
