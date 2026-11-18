import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  user: belongsTo('user', { inverse: null }),
  tutorial: belongsTo('tutorial', { inverse: 'userSavedTutorial' }),
});
