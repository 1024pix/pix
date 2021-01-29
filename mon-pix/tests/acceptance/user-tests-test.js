import { currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import visit from '../helpers/visit';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | User tests', function() {
  setupApplicationTest();
  setupMirage();
  let user;

  beforeEach(function() {
    user = server.create('user', 'withEmail');
  });

  describe('Authenticated cases as simple user', function() {
    beforeEach(async function() {
      await authenticateByEmail(user);
    });

    it('can visit /mes-parcours', async function() {
      //given
      server.create('campaign-participation-overview', {
        assessmentState: 'started',
        campaignCode: '123',
        campaignTitle: 'Campaign 1',
        createdAt: new Date('2020-04-20T04:05:06Z'),
        isShared: false,
      });

      // when
      await visit('/mes-parcours');

      // then
      expect(currentURL()).to.equal('/mes-parcours');
    });

    it('should display user participation cards', async function() {
      // given
      server.create('campaign-participation-overview', {
        assessmentState: 'started',
        campaignCode: '123',
        campaignTitle: 'Campaign 1',
        createdAt: new Date('2020-04-20T04:05:06Z'),
        isShared: false,
      });
      server.create('campaign-participation-overview', {
        assessmentState: 'completed',
        campaignCode: '123',
        campaignTitle: 'Campaign 2',
        createdAt: new Date('2020-05-20T04:05:06Z'),
        isShared: false,
      });

      // when
      await visit('/mes-parcours');

      // then
      expect(contains('Campaign 1')).to.exist;
      expect(contains('Campaign 2')).to.exist;
    });
  });

  describe('Not authenticated cases', function() {
    it('should redirect to home, when user is not authenticated', async function() {
      // when
      await visit('/mes-parcours');
      expect(currentURL()).to.equal('/connexion');
    });
  });
});
