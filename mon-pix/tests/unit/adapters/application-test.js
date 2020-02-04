import { expect } from 'chai';
import { it, describe } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | subscribers', function() {
  setupTest();

  it('should specify /api as the root url', function() {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // Then
    expect(applicationAdapter.namespace).to.equal('api');
  });

  it('should add header with authentication token when the session is authenticated', function() {
    // Given
    const access_token = '23456789';
    const applicationAdapter = this.owner.lookup('adapter:application');

    // When
    applicationAdapter.set('session', { isAuthenticated: true, data: { authenticated: { access_token } } });

    // Then
    expect(applicationAdapter.headers['Authorization']).to.equal(`Bearer ${access_token}`);
  });

  it('should not add header authentication token when the session is not authenticated', function() {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // When
    applicationAdapter.set('session', {});

    // Then
    expect(applicationAdapter.headers['Authorization']).to.be.undefined;
  });
});
