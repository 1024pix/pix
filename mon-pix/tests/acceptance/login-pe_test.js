import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';
import sinon from 'sinon';
import { visit } from '@ember/test-helpers';
import { expect } from 'chai';

describe('Acceptance | Route | Login pe', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  it('should redirect to Pole Emploi login page', async function () {
    // given
    const route = this.owner.lookup('route:login-pe');

    route.location = { replace: sinon.stub() };

    this.server.get('/pole-emploi/auth-url', (schema, request) => {
      const redirectUri = request.queryParams.redirect_uri;
      return {
        redirectTarget: `https://pole-emploi/connexion/oauth2/authorize?redirect_uri=${redirectUri}`,
        state: 'a8a3344f-6d7c-469d-9f84-bdd791e04fdf',
        nonce: '555c86fe-ed0a-4a80-80f3-45b1f7c2df8c',
      };
    });

    // when
    await visit('/connexion-pole-emploi');

    // then
    sinon.assert.calledWith(
      route.location.replace,
      `https://pole-emploi/connexion/oauth2/authorize?redirect_uri=${route.redirectUri}`
    );
    expect(route.session.get('data.state')).to.be.equal('a8a3344f-6d7c-469d-9f84-bdd791e04fdf');
    expect(route.session.get('data.nonce')).to.be.equal('555c86fe-ed0a-4a80-80f3-45b1f7c2df8c');
  });
});
