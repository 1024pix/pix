import { describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';
import { visit } from '@1024pix/ember-testing-library';

describe('Acceptance | Existing Participation', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  describe('Authenticated cases as simple user', function () {
    it('displays an error message', async function () {
      // given
      const user = server.create('user', 'withEmail');
      server.create('campaign', { code: '123' });
      server.create('organization-learner-identity', {
        firstName: 'First',
        lastName: 'Last',
      });
      await authenticateByEmail(user);

      // when
      const screen = await visit('/campagnes/123/participation-existante');

      //then
      expect(screen.getByText("Le parcours n'est pas accessible pour vous.")).to.exist;
      expect(screen.getByText('Il y a déjà une participation associée au nom de')).to.exist;
      expect(screen.getByText('First Last.')).to.exist;
      expect(
        screen.getByText("Rapprochez-vous de votre enseignant pour qu'il supprime votre participation dans Pix Orga.")
      ).to.exist;
    });
  });
});
