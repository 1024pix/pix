import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Pagination extends Component {
  @service intl;

  get firstItemPosition() {
    if (!this.args.pagination) return 0;

    const { page, pageSize } = this.args.pagination;
    return (page - 1) * pageSize + 1;
  }

  get lastItemPosition() {
    if (!this.args.pagination) return 0;
    const { rowCount, pageSize } = this.args.pagination;

    return Math.min(rowCount, this.firstItemPosition + pageSize - 1);
  }

  get texts() {
    if (!this.args.pagination) return {};

    return {
      title: this.intl.t('common.pagination.title'),
      pageSize: this.intl.t('common.pagination.pageSize'),
      pageElementCount: this.intl.t('common.pagination.pageElementCount', {
        totalPage: this.args.pagination.pageCount,
        total: this.args.pagination.rowCount,
        start: this.firstItemPosition,
        end: this.lastItemPosition,
      }),
      pageNumber: this.intl.t('common.pagination.pageNumber', {
        current: this.args.pagination.page,
        total: this.args.pagination.pageCount,
      }),
      previousPage: this.intl.t('common.pagination.previousPage'),
      nextPage: this.intl.t('common.pagination.nextPage'),
    };
  }

  <template>
    <PixPagination
      @pagination={{@pagination}}
      @onChange={{@onChange}}
      @texts={{this.texts}}
      @pageOptions={{@pageOptions}}
    />
  </template>
}
