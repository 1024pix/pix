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

  it('should add header with authentication token ', function() {
    // Given
    const expectedToken = '23456789';
    const applicationAdapter = this.owner.lookup('adapter:application');

    // When
    applicationAdapter.set('session', { data: { authenticated: { token: expectedToken } } });

    expect(applicationAdapter.get('headers')).to.deep.equal({
      'Authorization': `Bearer ${expectedToken}`
    });
  });

  it('should allow to logout ', function() {
    // Given
    const applicationAdapter = this.owner.lookup('adapter:application');

    // Then
    expect(applicationAdapter.get('headers')).to.deep.equal({
      'Authorization': ''
    });
  });
});
