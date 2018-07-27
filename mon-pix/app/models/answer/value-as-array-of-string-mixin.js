import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';

export default Mixin.create({

  _valuesAsMap: computed('value', function() {
    try {
      return jsyaml.load(this.get('value'));
    } catch (e) {
      return undefined;
    }
  })

});
