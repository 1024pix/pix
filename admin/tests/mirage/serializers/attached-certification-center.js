import { JSONAPISerializer } from 'miragejs';

export default JSONAPISerializer.extend({
  typeKeyForModel() {
    return 'certification-centers';
  },
});
