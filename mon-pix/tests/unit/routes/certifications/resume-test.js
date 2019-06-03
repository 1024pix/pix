import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Certification | Resume', function() {
  setupTest();

  let route;
  const certificationCourseId = 'certification_course_id';

  beforeEach(function() {
    route = this.owner.lookup('route:certifications.resume');

    route.transitionTo = sinon.stub();
  });

  describe('#model', function() {

    it('should transition to courses.create-assessment', function() {
      // given
      const params = { certification_course_id: certificationCourseId };
      route.transitionTo.resolves();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(route.transitionTo);
        sinon.assert.calledWith(route.transitionTo, 'courses.create-assessment', certificationCourseId);
      });
    });
  });
});
