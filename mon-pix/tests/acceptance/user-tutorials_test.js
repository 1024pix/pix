import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { visit, currentURL } from '@ember/test-helpers';
import { authenticateByEmail } from '../helpers/authentication';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | mes-tutos', function () {
  setupApplicationTest();
  setupMirage();

  let user;

  beforeEach(async function () {
    //given
    user = server.create('user', 'withEmail');
    server.create('feature-toggle', { id: 0, isNewTutorialsPageEnabled: true });
    await authenticateByEmail(user);
  });

  it('can visit /mes-tutos', async function () {
    await visit('/mes-tutos');
    expect(currentURL()).to.equal('/mes-tutos/recommandes');
  });
});
