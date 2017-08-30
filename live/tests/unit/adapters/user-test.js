import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | subscribers', function() {
  setupTest('adapter:user', {
    needs: ['service:session']
  });

  describe('#queryRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.subject();
      adapter.ajax = sinon.stub().resolves();
    });

    it('should exist', function() {
      // when
      const adapter = this.subject();
      // then
      return expect(adapter.queryRecord()).to.be.ok;
    });

    it('should return a resolved promise', function(done) {
      // when
      const promise = adapter.queryRecord();
      // then
      promise.then(done);
    });

    it('should called GET /api/users/me', function() {
      // when
      adapter.queryRecord();

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/me');
    });

  });

  describe('#findRecord', () => {

    let adapter;

    beforeEach(function() {
      adapter = this.subject();
      adapter.ajax = sinon.stub().resolves();
    });

    it('should exist', function() {
      // when
      const adapter = this.subject();
      // then
      return expect(adapter.findRecord()).to.be.ok;
    });

    it('should not reload data from API when already in store', function() {
      // when
      const adapter = this.subject();

      // then
      expect(adapter.shouldBackgroundReloadRecord()).to.equal(false);
    });

    it('should return a resolved promise', function(done) {
      // when
      const promise = adapter.findRecord();
      // then
      promise.then(done);
    });

    it('should called GET /api/users/me', function() {
      // when
      adapter.findRecord();

      // then
      sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/users/me');
    });

  });

});
