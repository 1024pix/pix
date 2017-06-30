import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | compte', function() {
  setupTest('route:compte', {
    needs: ['service:current-routed-modal', 'service:session']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  it('should redirect to /connexion', function() {
    // Given
    const route = this.subject();

    // Then
    expect(route.authenticationRoute).to.equal('/connexion');
  });
});
