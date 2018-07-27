import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateAsSimpleUser } from '../helpers/testing';

describe('Acceptance | error page', function() {
  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('should redirect to route /connexion when the api returned a 401 error', async function() {
    // given
    authenticateAsSimpleUser();
    server.get('/certifications', { errors: [{ code: 401 }] }, 401);

    // when
    await visit('/mes-certifications');

    // then
    expect(currentURL()).to.equal('/connexion');
  });

  it('should display the error page when the api returned an error which is not 401', async function() {
    // given
    authenticateAsSimpleUser();
    server.get('/certifications', { errors: [{ code: 500 }] }, 500);

    // when
    await visit('/mes-certifications');

    // then
    expect(currentURL()).to.equal('/mes-certifications');
    findWithAssert('.error-page');
  });

});

