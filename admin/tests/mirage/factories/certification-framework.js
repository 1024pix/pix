import { Factory } from 'miragejs';

export default Factory.extend({
  scope() {
    return this.id;
  },

  versionSummaries() {
    return [];
  },
});
