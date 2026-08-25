import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import { t } from 'ember-intl';

function firstItemPosition(pagination) {
  if (!pagination) return 0;

  const { page, pageSize } = pagination;
  return (page - 1) * pageSize + 1;
}

function lastItemPosition(pagination) {
  if (!pagination) return 0;
  const { rowCount, pageSize } = pagination;

  return Math.min(rowCount, firstItemPosition(pagination) + pageSize - 1);
}

<template>
  <PixPagination
    @pagination={{@pagination}}
    @onChange={{@onChange}}
    @beforeResultsPerPageLabel={{t "common.pagination.beforeResultsPerPageLabel"}}
    @selectPageSizeLabel={{t "common.pagination.selectPageSizeLabel"}}
    @singlePageElementCountLabel={{t "common.pagination.singlePageElementCountLabel" total=@pagination.rowCount}}
    @multiplePageElementCountLabel={{t
      "common.pagination.multiplePageElementCountLabel"
      total=@pagination.rowCount
      start=(firstItemPosition @pagination)
      end=(lastItemPosition @pagination)
    }}
    @pageNumberLabel={{t "common.pagination.pageNumberLabel" current=@pagination.page total=@pagination.pageCount}}
    @previousPageLabel={{t "common.pagination.previousPageLabel"}}
    @nextPageLabel={{t "common.pagination.nextPageLabel"}}
    @pageOptions={{@pageOptions}}
  />
</template>
