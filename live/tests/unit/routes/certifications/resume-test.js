import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import { expect } from 'chai';

describe('Unit | Route | Certification | resume', function() {
  setupTest('route:certifications.resume', {
    needs: ['service:current-routed-modal']
  });

  let route;
  let StoreStub;
  let findRecordStub;
  let queryRecordStub;
  let queryStub;
  const certificationCourseId = 'certification_course_id';
  const assessmentId = 'assessment_id';

  beforeEach(function() {
    // define stubs
    findRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    queryStub = sinon.stub();
    StoreStub = Service.extend({
      findRecord: findRecordStub,
      queryRecord: queryRecordStub,
      query: queryStub
    });

    // manage dependency injection context
    this.register('service:store', StoreStub);
    this.inject.service('store', { as: 'store' });

    // instance route object
    route = this.subject();
    route.transitionTo = sinon.stub();
  });

  describe('#model', function() {

    it('should get the assessment associated to the certification course', function() {
      // given
      const params = { certification_course_id: certificationCourseId };
      const filters = {
        filter: {
          courseId: certificationCourseId
        }
      };
      const retrievedAssessments = [EmberObject.create({ id: 1 })];
      route.get('store').query.resolves(retrievedAssessments);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryStub);
        sinon.assert.calledWith(queryStub, 'assessment', filters);
      });
    });

    it('should return the first assessment associated to the certification course', function() {
      // given
      const params = { certification_course_id: certificationCourseId };
      const retrievedAssessments = [];
      retrievedAssessments.pushObject(EmberObject.create({ id: 1 }));
      route.get('store').query.resolves(retrievedAssessments);

      // when
      const promise = route.model(params);

      // then
      return promise.then((assessment) => {
        expect(assessment.id).to.equal(1);
      });
    });
  });

  describe('#afterModel', function() {

    const course = EmberObject.create({ id: 'certification_course_id' });
    const assessment = EmberObject.create({ id: assessmentId, course });

    it('should get the next challenge of the assessment', function() {
      // given
      queryRecordStub.resolves();

      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: assessmentId });
      });
    });

    context('when the next challenge exists', function() {

      it('should redirect to the challenge view', function() {
        // given
        const nextChallenge = EmberObject.create({ id: 456 });
        queryRecordStub.resolves(nextChallenge);

        // when
        const promise = route.afterModel(assessment);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(route.transitionTo);
          sinon.assert.calledWith(route.transitionTo, 'assessments.challenge', assessmentId, 456);
        });
      });

    });

    context('when the next challenge does not exist (is null)', function() {

      it('should redirect to certification results page', function() {
        // given
        queryRecordStub.rejects();

        // when
        const promise = route.afterModel(assessment);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(route.transitionTo);
          sinon.assert.calledWith(route.transitionTo, 'certifications.results', certificationCourseId);
        });
      });

    });
  });

  describe('#error', function() {

    it('should redirect to index page', function() {
      // given
      const route = this.subject();
      route.transitionTo = sinon.spy();

      // when
      route.send('error');

      // then
      sinon.assert.calledWith(route.transitionTo, 'index');
    });
  });

});
