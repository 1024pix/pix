import { hasMany, Model } from 'miragejs';

export default Model.extend({
  tutorials: hasMany(),
  learningMoreTutorials: hasMany('tutorial'),
});
