import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize() {
    // XXX from https://github.com/samselikoff/ember-cli-mirage/issues/584

    // This is how to call super, as Mirage borrows [Backbone's implementation of extend](http://backbonejs.org/#Model-extend)
    let json = ApplicationSerializer.prototype.serialize.apply(this, arguments);

    if (!!json.challenge) {
      // single model
      json.challenge.links = {
        assessment: `/assessments/${json.challenge.assessmentId}`
      };

      return json;

    } else if (!!json.challenges) {
      // collection

      json.challenges.forEach((c) => {
        c.links = {
          assessment: `/assessments/${c.assessmentId}`
        };
      });

      return json;
    } else {
      throw new Error("I don't know why we got there.");
    }
  }
});
