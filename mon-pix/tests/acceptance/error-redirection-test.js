import { currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { authenticateViaEmail } from '../helpers/testing';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Error page', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    defaultScenario(this.server);
    user = server.create('user', 'withEmail');
  });

  it('should display the error page when the api returned an error which is not 401', async function() {
    // given
    await authenticateViaEmail(user);
    this.server.get('/certifications', { errors: [{ code: 500 }] }, 500);

    // when
    await visitWithAbortedTransition('/mes-certifications');

    // then
    expect(currentURL()).to.equal('/mes-certifications');
    expect(find('.error-page')).to.exist;
  });

});

