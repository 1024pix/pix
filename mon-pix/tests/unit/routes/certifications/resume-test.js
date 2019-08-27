import EmberObject from '@ember/object';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Certification | Resume', function() {
  setupTest();

  describe('#model', function() {
    const certificationCourseId = 'certification-course-id';
    let assessment;
    let queryStub;
    let getAssessmentStub;
    let storeStub;
    let route;
    const params = { certification_course_id: certificationCourseId };

    beforeEach(function() {
      assessment = EmberObject.create({ id: 123 });
      getAssessmentStub = sinon.stub().returns(assessment);
      queryStub = sinon.stub().resolves({
        get: getAssessmentStub,
      });
      storeStub = Service.create({ query: queryStub });
      route = this.owner.lookup('route:certifications.resume');
      route.set('store', storeStub);
      route.replaceWith = sinon.stub();
    });

    it('should query the assessment linked to the certification course', function() {
      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'assessment', {
          filter: {
            type: 'CERTIFICATION',
            courseId: certificationCourseId,
            resumable: true
          }
        });
      });
    });

    it('should resume the assessment', function() {
      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.replaceWith, 'assessments.resume', assessment.get('id'));
      });
    });

  });

});
