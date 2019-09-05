import { expect } from 'chai';
import { it, describe } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | subscribers', function() {
  setupTest();

  it('should specify /api as the root url', function() {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // Then
    expect(applicationAdapter.namespace).to.equal('api');
  });

  it('should add header with authentication token ', function() {
    // Given
    const xhr = {
      setRequestHeader: sinon.stub()
    };
    const access_token = '23456789';
    const applicationAdapter = this.owner.lookup('adapter:application');

    // When
    applicationAdapter.set('session', { data: { authenticated: { access_token } } });
    applicationAdapter.authorize(xhr);

    // Then
    sinon.assert.calledWith(xhr.setRequestHeader, 'Authorization', `Bearer ${access_token}`);
  });

  it('should not set Authorization header without token ', function() {
    // Given
    const xhr = {
      setRequestHeader: sinon.stub()
    };
    const access_token = '';
    const applicationAdapter = this.owner.lookup('adapter:application');

    // When
    applicationAdapter.set('session', { data: { authenticated: { access_token } } });
    applicationAdapter.authorize(xhr);

    // Then
    sinon.assert.notCalled (xhr.setRequestHeader);
  });

});
