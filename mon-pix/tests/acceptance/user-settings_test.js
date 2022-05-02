import { visit } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { authenticateByEmail } from '../helpers/authentication';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';

describe('Acceptance | User settings', function () {
  setupApplicationTest();
  setupMirage();

  let user;

  beforeEach(async function () {
    //given
    user = server.create('user', 'withEmail');
    await authenticateByEmail(user);
  });

  it('should display form to edit user settings', async function () {
    // when
    await visit('/preferences');

    // then
    expect(contains('Préférences utilisateur')).to.exist;
  });
});
