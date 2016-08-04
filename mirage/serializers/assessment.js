
import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  serialize() {

    // XXX from https://github.com/samselikoff/ember-cli-mirage/issues/584

    // This is how to call super, as Mirage borrows [Backbone's implementation of extend](http://backbonejs.org/#Model-extend)
    let json = ApplicationSerializer.prototype.serialize.apply(this, arguments);

    json.assessment.links = {
      course: `/api/live/courses/${json.assessment.courseId}`,
      challenges: `/api/live/assessments/${json.assessment.id}/challenges`
    };

    return json;
  }
});
