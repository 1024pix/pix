import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Courses | Create Assessment', function() {
  setupTest();

  let route;
  let queryRecordStub;
  let createRecordStub;
  let queryStub;
  let getAssessmentStub;
  let storeStub;
  let course;
  let assessment;
  let createdAssessment;
  let challenge;

  beforeEach(function() {
    course = EmberObject.create({ id: 1, type: 'PLACEMENT' });
    assessment = EmberObject.create({ id: 123 });
    createdAssessment = EmberObject.create({ id: 1234 });
    challenge = EmberObject.create({ id: 1 });
    createRecordStub = sinon.stub().returns({
      save: sinon.stub().resolves(createdAssessment),
    });
    queryRecordStub = sinon.stub().resolves(challenge);
    getAssessmentStub = sinon.stub().returns(assessment);
    queryStub = sinon.stub().resolves({
      get: getAssessmentStub,
    }),

    storeStub = Service.create({
      queryRecord: queryRecordStub, query: queryStub, createRecord: createRecordStub });
    route = this.owner.lookup('route:courses.create-assessment');
    route.set('store', storeStub);
    route.replaceWith = sinon.stub();
  });

  describe('#afterModel', function() {
    it('should call queryStub with filters', function() {
      // when
      const promise = route.afterModel(course);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'assessment', { filter: { type: course.get('type'), courseId: course.id, resumable: true } });
      });
    });

    context('when there is a started assessment', function() {

      it('should resume the assessment', function() {
        // when
        const promise = route.afterModel(course);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(route.replaceWith, 'assessments.resume', assessment.get('id'));
        });
      });
    });

    context('when there is no started assessment', function() {

      beforeEach(function() {
        queryStub.resolves([]);
      });

      it('create a new assessment for the course', function() {
        // when
        const promise = route.afterModel(course);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(createRecordStub, 'assessment', { course, type: course.get('type') });
        });
      });

      it('should resume the assessment', function() {
        // when
        const promise = route.afterModel(course);

        // then
        return promise.then(() => {
          sinon.assert.calledWith(route.replaceWith, 'assessments.resume', createdAssessment.get('id'));
        });
      });
    });
  });
});
