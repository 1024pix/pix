import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),

  pagination: null,

  nextPage: computed('pagination', function() {
    return Math.min(this.pagination.page + 1, this.pagination.pageCount);
  }),

  previousPage: computed('pagination', function() {
    return Math.max(this.pagination.page - 1, 1);
  }),

  actions: {

    changePageSize(pageSize) {
      this.router.transitionTo({ queryParams: { pageSize, pageNumber: 1 } });
    },

  }
});
