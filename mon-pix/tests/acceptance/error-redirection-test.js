import { currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { authenticateByEmail } from '../helpers/authentification';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Error page', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  it('should display the error page when the api returned an error which is not 401', async function() {
    // given
    await authenticateByEmail(user);
    this.server.get('/certifications', { errors: [{ code: 500 }] }, 500);

    // when
    await visit('/mes-certifications');

    // then
    expect(currentURL()).to.equal('/mes-certifications');
    expect(find('.error-page')).to.exist;
  });

});

