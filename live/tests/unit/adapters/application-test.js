import {expect} from 'chai';
import {it, describe} from 'mocha';
import {setupTest} from 'ember-mocha';

describe('Unit | Route | subscribers', function() {
  setupTest('adapter:application', {
    needs: ['service:authentication']
  });

  it('should precise /api as the root url', function() {
    // Given
    const applicationAdapter = this.subject();

    // Then
    expect(applicationAdapter.namespace).to.equal('api');
  });

  it('should add header with authentication token ', function() {
    // Given
    const expectedToken = '23456789';
    const applicationAdapter = this.subject();

    // When
    applicationAdapter.get('authentication').set('token', expectedToken);

    // Then
    expect(applicationAdapter.get('headers')).to.deep.equal({
      'www-authentication': `bearer ${expectedToken}`
    });
  });

  it('should allow to logout ', function() {
    // Given
    const applicationAdapter = this.subject();
    applicationAdapter.get('authentication').set('token', '123456789');

    // When
    applicationAdapter.get('authentication').logout();

    // Then
    expect(applicationAdapter.get('headers')).to.deep.equal({
      'www-authentication': ''
    });
  });
});
