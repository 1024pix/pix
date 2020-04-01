import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import jsyaml from 'js-yaml';

export default Mixin.create({

  _valuesAsMap: computed('value', function() {
    try {
      return jsyaml.load(this.value);
    } catch (e) {
      return undefined;
    }
  })

});
