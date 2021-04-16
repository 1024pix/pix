import { describe, it } from 'mocha';
import { expect } from 'chai';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';
import { authenticateByEmail } from '../helpers/authentication';

describe('Acceptance | personal-information', function() {
  setupApplicationTest();
  setupMirage();

  context('When user is connected', function() {

    it('should display user personal information', async function() {
      // given
      const user = server.create('user', {
        firstName: 'John',
        lastName: 'DOE',
        email: 'john.doe@example.net',
        username: 'john.doe0101',
        password: 'pixi',
        lang: 'fr',
      });
      await authenticateByEmail(user);

      // when
      await visit('/mon-compte/informations-personnelles');

      // then
      expect(contains(user.firstName)).to.exist;
      expect(contains(user.lastName)).to.exist;
      expect(contains('Français')).to.exist;
    });
  });
});
