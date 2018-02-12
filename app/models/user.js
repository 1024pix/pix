import { Model, attr } from 'ember-data';


export default Model.extend({
  firstName: attr(),
  lastName: attr(),
  email: attr(),
});
