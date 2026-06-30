import { Factory } from 'miragejs';

export default Factory.extend({
  name(index) {
    return `Centre de certification ${index}`;
  },

  externalId(index) {
    return `EXT-${index}`;
  },
});
