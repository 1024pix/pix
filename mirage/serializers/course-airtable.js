
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize() {

    // This is how to call super, as Mirage borrows [Backbone's implementation of extend](http://backbonejs.org/#Model-extend)
    let json = ApplicationSerializer.prototype.serialize.apply(this, arguments);

    if (json.courseAirtables) {
      return {
        records: json.courseAirtables
      };
    }

    return json;
  }
});
