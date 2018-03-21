import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | certification test', function() {
  setupTest('route:certifications.start', {
    needs: ['service:current-routed-modal', 'service:session'],
  });

  let route;

  it('exists', function() {
    route = this.subject();
    expect(route).to.be.ok;
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

    it('should return the start-error page if error is 403', function() {
      route.render = sinon.stub();

      // given
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

    it('should replace current route with courses.create-assessment', function() {
      // given
      route.replaceWith = sinon.stub();

      // when
      route.send('submit', { id: 1 });

      // then
      sinon.assert.called(route.replaceWith);
      sinon.assert.calledWith(route.replaceWith, 'courses.create-assessment', 1);
    });

  });

});
