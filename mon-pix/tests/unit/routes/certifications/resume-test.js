import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Certification | resume', function() {
  setupTest('route:certifications.resume', {
    needs: ['service:current-routed-modal', 'service:metrics']
  });

  let route;
  const certificationCourseId = 'certification_course_id';

  beforeEach(function() {
    // instance route object
    route = this.subject();
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
