import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Service from '@ember/service';

describe('Unit | Route | certification test', function() {
  setupTest('route:certification-course', {
    needs: ['service:current-routed-modal', 'service:session'],
  });

  let route;
  let createRecordStub;
  let storeStub;
  let certificationCourse;

  it('exists', function() {
    route = this.subject();
    expect(route).to.be.ok;
  });

  describe('#model', function() {

    beforeEach(function() {
      certificationCourse = { id: 1, save: sinon.stub() };
      createRecordStub = sinon.stub().returns(certificationCourse);

      storeStub = Service.extend({
        createRecord: createRecordStub
      });

      this.register('service:store', storeStub);
      this.inject.service('store', { as: 'store' });

      route = this.subject();

    });

    context('when user is logged', function() {

      it('should generate certification test', function() {
        // when
        route.model({ code: '123456' });

        // then
        sinon.assert.called(createRecordStub);
        sinon.assert.calledWithExactly(createRecordStub, 'course', { sessionCode: '123456' });

      });

      it('should save certification test', function() {
        // when
        route.model({ code: '123456' });

        // then
        sinon.assert.called(certificationCourse.save);
      });
    });

  });

  describe('#error', function() {

    it('should redirect to index if error is not 403', function() {
      // given
      route.transitionTo = sinon.stub();
      const error = { errors: [{ status: '404' }] };

      // when
      route.send('error', error);

      // then
      sinon.assert.called(route.transitionTo);
      sinon.assert.calledWith(route.transitionTo, 'index');
    });

    it('should return true to redirect to certification error page if error is 403', function() {
      // given
      route.transitionTo = sinon.stub();
      const error = { errors: [{ status: '403' }] };

      // when
      const result = route.send('error', error);

      // then
      expect(result).to.be.true;
      sinon.assert.notCalled(route.transitionTo);
    });

  });
});
