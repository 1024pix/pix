import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Certification | Start', function() {
  setupTest();
  let route;

  describe('#error', function() {

    it('should redirect to index if error is not 403', function() {
      // given
      route = this.owner.lookup('route:certifications.start');
      route.transitionTo = sinon.stub();
      const error = { errors: [{ status: '404' }] };

      // when
      route.send('error', error);

      // then
      sinon.assert.called(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'index');
    });

    it('should return the start-error page if error is 403', function() {
      // given
      route = this.owner.lookup('route:certifications.start');
      route.render = sinon.stub();
      route.transitionTo = sinon.stub();
      const error = { errors: [{ status: '403' }] };

      // when
      route.send('error', error);

      // then
      sinon.assert.called(route.render);
      sinon.assert.calledWith(route.render, 'certifications.start-error');
    });

  });

  describe('#submit', function() {
    let certificationCourse;
    let assessment;
    let queryStub;
    let getAssessmentStub;
    let storeStub;

    beforeEach(function() {
      certificationCourse = EmberObject.create({ id: 1, type: 'PLACEMENT' });
      assessment = EmberObject.create({ id: 123 });
      getAssessmentStub = sinon.stub().returns(assessment);
      queryStub = sinon.stub().resolves({
        get: getAssessmentStub,
      });
      storeStub = Service.create({ query: queryStub });
      route = this.owner.lookup('route:certifications.start');
      route.set('store', storeStub);
      route.replaceWith = sinon.stub();
    });

    it('should query the assessment linked to the certification course', function() {
      // when
      const promise = route.send('submit', certificationCourse);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'assessment', {
          filter: {
            type: certificationCourse.get('type'),
            courseId: certificationCourse.id,
            resumable: true
          }
        });
      });
    });

    it('should resume the assessment', function() {
      // when
      const promise = route.send('submit', certificationCourse);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.replaceWith, 'assessments.resume', assessment.get('id'));
      });
    });

  });

});
