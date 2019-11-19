import EmberObject from '@ember/object';
import Service from '@ember/service';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Certification | Resume', function() {
  setupTest();

  describe('#model', function() {
    const certificationCourseId = 'certification-course-id';
    let certificationCourse;
    let assessment;
    let queryStub;
    let peekRecordStub;
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
      certificationCourse = EmberObject.create({ id: certificationCourseId, assessment, get: getAssessmentStub });
      peekRecordStub = sinon.stub().returns(certificationCourse);
      storeStub = Service.create({ query: queryStub, peekRecord: peekRecordStub });
      route = this.owner.lookup('route:certifications.resume');
      route.set('store', storeStub);
      route.replaceWith = sinon.stub();
    });

    it('should peekRecord the certification course', async function() {
      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(peekRecordStub, 'certification-course', certificationCourseId);
    });

    it('should resume the assessment linked to the certification course', async function() {
      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(route.replaceWith, 'assessments.resume', assessment);
    });

  });

});
