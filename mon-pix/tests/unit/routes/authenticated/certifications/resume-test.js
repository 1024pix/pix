import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Certification | Resume', function (hooks) {
  setupTest(hooks);

  module('#model', function (hooks) {
    const certificationCourseId = 'certification-course-id';
    let certificationCourse;
    let assessment;
    let queryStub;
    let peekRecordStub;
    let getAssessmentStub;
    let storeStub;
    let route;
    const params = { certification_course_id: certificationCourseId };

    hooks.beforeEach(function () {
      assessment = EmberObject.create({ id: 123 });
      getAssessmentStub = sinon.stub().returns(assessment);
      queryStub = sinon.stub().resolves({
        get: getAssessmentStub,
      });
      certificationCourse = EmberObject.create({ id: certificationCourseId, assessment, get: getAssessmentStub });
      peekRecordStub = sinon.stub().returns(certificationCourse);
      storeStub = Service.create({ query: queryStub, peekRecord: peekRecordStub });
      route = this.owner.lookup('route:authenticated/certifications.resume');
      route.set('store', storeStub);
      route.router = { replaceWith: sinon.stub() };
    });

    test('should peekRecord the certification course', async function (assert) {
      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(peekRecordStub, 'certification-course', certificationCourseId);
      assert.ok(true);
    });

    test('should resume the assessment linked to the certification course', async function (assert) {
      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(route.router.replaceWith, 'assessments.resume', assessment);
      assert.ok(true);
    });
  });
});
