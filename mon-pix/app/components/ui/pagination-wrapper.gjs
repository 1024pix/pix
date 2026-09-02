import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { hash } from '@ember/helper';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class PaginationWrapper extends Component {
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

  <template>
    <PixPagination
      @pagination={{@pagination}}
      @pageOptions={{@pageOptions}}
      @isCondensed={{@isCondensed}}
      @texts={{hash
        title=(t "common.pagination.title")
        pageSize=(t "common.pagination.pageSize")
        pageElementCount=(t
          "common.pagination.pageElementCount"
          totalPage=@pagination.pageCount
          total=@pagination.rowCount
          start=this.firstItemPosition
          end=this.lastItemPosition
        )
        pageNumber=(t "common.pagination.pageNumber" current=@pagination.page total=@pagination.pageCount)
        previousPage=(t "common.pagination.previousPage")
        nextPage=(t "common.pagination.nextPage")
      }}
    />
  </template>
}
