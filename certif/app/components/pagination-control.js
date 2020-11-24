import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class PaginationControl extends Component {

  @service router;

  get currentPage() {
    return this.args.pagination ? this.args.pagination.page : 1;
  }

  get pageCount() {
    return this.args.pagination ? this.args.pagination.pageCount : 0;
  }

  get pageSize() {
    return this.args.pagination ? this.args.pagination.pageSize : 10;
  }

  get nextPage() {
    return Math.min(this.currentPage + 1, this.pageCount);
  }

  get previousPage() {
    return Math.max(this.currentPage - 1, 1);
  }

  @action
  changePageSize(event) {
    this.router.replaceWith({ queryParams: { pageSize: event.target.value, pageNumber: 1 } });
  }
}
