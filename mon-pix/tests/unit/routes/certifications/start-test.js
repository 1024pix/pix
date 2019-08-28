import EmberObject from '@ember/object';
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
    let storeStub;

    beforeEach(function() {
      certificationCourse = EmberObject.create({ id: 1 });
      route = this.owner.lookup('route:certifications.start');
      route.set('store', storeStub);
      route.replaceWith = sinon.stub();
    });

    it('should redirect to certifications.resume', function() {
      // when
      route.send('submit', certificationCourse.get('id'));

      // then
      sinon.assert.calledWith(route.replaceWith, 'certifications.resume', certificationCourse.get('id'));
    });

  });

});
