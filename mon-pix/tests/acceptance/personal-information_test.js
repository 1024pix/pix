import { describe, it } from 'mocha';
import { expect } from 'chai';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateByEmail } from '../helpers/authentication';
import { visit } from '@1024pix/ember-testing-library';

describe('Acceptance | personal-information', function () {
  setupApplicationTest();
  setupMirage();

  context('When user is connected', function () {
    it('should display user personal information', async function () {
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
      const screen = await visit('/mon-compte/informations-personnelles');

      // then
      const userNames = screen.getAllByText(user.firstName).length;
      expect(userNames).to.equal(2);
      expect(screen.getByText(user.lastName)).to.exist;
    });
  });
});
