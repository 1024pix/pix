import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class PaginationControl extends Component {
  @service router;
  options = [
    { value: '10', label: '10' },
    { value: '25', label: '25' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
  ];

  get nextPage() {
    return Math.min(this.args.pagination.page + 1, this.args.pagination.pageCount);
  }

  get previousPage() {
    return Math.max(this.args.pagination.page - 1, 1);
  }

  @action
  changePageSize(event) {
    const pageSize = event.target.value;
    this.router.transitionTo({ queryParams: { pageSize, pageNumber: 1 } });
  }
}
