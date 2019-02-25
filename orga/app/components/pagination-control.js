import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  pagination: null,

  nextPage: computed('pagination', function () {
    return Math.min(this.pagination.page + 1, this.pagination.pageCount);
  }),

  previousPage: computed('pagination', function () {
    return Math.max(this.pagination.page - 1, 1);
  })
});
