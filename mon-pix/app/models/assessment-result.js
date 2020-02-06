import Model, { belongsTo } from '@ember-data/model';

export default Model.extend({

  assessment: belongsTo('assessment'),

});
