import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Service | authentication', function() {
  setupTest('service:authentication', {});

  // Replace this with your real tests.
  it('exists', function() {
    const service = this.subject();
    expect(service).to.be.ok;
  });

  it('has a property token', function() {
    // Given
    const service = this.subject();

    // Then
    expect(service.get('token')).to.equal('');
  });

  it('has a token that can be set', function() {
    // Given
    const service = this.subject();

    // When
    service.set('token', '234UI');

    // Then
    expect(service.get('token')).to.equal('234UI');
  });

  it('should allow to logout', function() {
    // Given
    const service = this.subject();
    service.set('token', '234UI');

    // When
    service.logout();

    // Then
    expect(service.get('token')).to.equal('');
  });
});
