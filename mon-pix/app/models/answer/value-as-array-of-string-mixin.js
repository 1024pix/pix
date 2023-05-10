import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import jsyaml from 'js-yaml';

const schema = jsyaml.DEFAULT_SCHEMA.extend(require('js-yaml-js-types').all);

export default Mixin.create({
  _valuesAsMap: computed('value', function () {
    try {
      return jsyaml.load(this.value, { schema });
    } catch (e) {
      return undefined;
    }
  }),
});
