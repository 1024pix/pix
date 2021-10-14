import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

const DEFAULT_PAGE_SIZE = 10;

export default class PaginationControl extends Component {
  @service router;

  get currentPage() {
    return this.args.pagination ? this.args.pagination.page : 1;
  }

  get pageCount() {
    if (!this.args.pagination) return 0;
    if (this.args.pagination.pageCount === 0) return 1;
    return this.args.pagination.pageCount;
  }

  get pageSize() {
    return this.args.pagination ? this.args.pagination.pageSize : DEFAULT_PAGE_SIZE;
  }

  get isNextPageDisabled() {
    return this.currentPage === this.pageCount || this.pageCount === 0;
  }

  get nextPage() {
    return Math.min(this.currentPage + 1, this.pageCount);
  }

  get isPreviousPageDisabled() {
    return this.currentPage === 1 || this.pageCount === 0;
  }

  get previousPage() {
    return Math.max(this.currentPage - 1, 1);
  }

  get resultsCount() {
    return this.args.pagination ? this.args.pagination.rowCount : 0;
  }

  get firstItemPosition() {
    if (!this.args.pagination) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get lastItemPosition() {
    if (!this.args.pagination) return 0;
    const { rowCount } = this.args.pagination;
    return Math.min(rowCount, this.firstItemPosition + this.pageSize - 1);
  }

  get pageOptions() {
    return [
      { label: '10', value: 10 },
      { label: '25', value: 25 },
      { label: '50', value: 50 },
      { label: '100', value: 100 },
    ];
  }

  @action
  changePageSize(event) {
    this.router.replaceWith({ queryParams: { pageSize: event.target.value, pageNumber: 1 } });
  }

  @action
  goToNextPage() {
    this.router.replaceWith({ queryParams: { pageNumber: this.nextPage } });
  }

  @action
  goToPreviousPage() {
    this.router.replaceWith({ queryParams: { pageNumber: this.previousPage } });
  }
}
