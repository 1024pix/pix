import { describe, it, beforeEach } from 'mocha';
import { visit } from '@ember/test-helpers';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import setupIntl from '../helpers/setup-intl';
import { contains } from '../helpers/contains';

describe('Acceptance | Existing Participation', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();

  describe('Authenticated cases as simple user', function () {
    beforeEach(async function () {
      const user = server.create('user', 'withEmail');
      server.create('campaign', { code: '123' });
      server.create('schooling-registration-user-association', {
        firstName: 'First',
        lastName: 'Last',
        campaignCode: '123',
      });
      await authenticateByEmail(user);
    });

    it('displays an error message', async function () {
      await visit('/campagnes/123/participation-existante');
      expect(contains("Le parcours n'est pas accessible pour vous.")).to.exist;
      expect(contains('Il y a déjà une participation associée au nom de')).to.exist;
      expect(contains('First Last.')).to.exist;
      expect(contains("Rapprochez-vous de votre enseignant pour qu'il supprime votre participation dans Pix Orga.")).to
        .exist;
    });
  });
});
