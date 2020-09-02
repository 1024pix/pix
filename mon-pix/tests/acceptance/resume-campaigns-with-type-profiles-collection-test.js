import { click, fillIn, currentURL } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { resumeCampaignOfTypeProfilesCollectionByCode, completeCampaignOfTypeProfilesCollectionByCode } from '../helpers/campaign';
import visit from '../helpers/visit';
import { invalidateSession } from 'ember-simple-auth/test-support';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { contains } from '../helpers/contains';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

describe('Acceptance | Campaigns | Resume Campaigns with type Profiles Collection', function() {
  setupApplicationTest();
  setupMirage();
  let campaign;
  let studentInfo;

  beforeEach(async function() {
    studentInfo = server.create('user', 'withEmail');
    await authenticateByEmail(studentInfo);
    campaign = server.create('campaign', { idPixLabel: 'email', type: PROFILES_COLLECTION });
    await resumeCampaignOfTypeProfilesCollectionByCode(campaign.code, true);
  });

  context('When the user is not logged', function() {

    beforeEach(async function() {
      await invalidateSession();
      // Reset state, invalidateSession() is not doing it...
      this.owner.lookup('route:campaigns.start-or-resume')._resetState();
      await visit(`/campagnes/${campaign.code}`);
      await click(contains('C’est parti !'));
    });

    it('should propose to signup', function() {
      expect(currentURL()).to.contains('/inscription');
    });

    it('should redirect to send profile page when user logs in', async function() {
      // given
      await click('.sign-form-header__subtitle [href="/connexion"]');
      await fillIn('#login', studentInfo.email);
      await fillIn('#password', studentInfo.password);

      // when
      await click('.sign-form-body__bottom-button button');

      // then
      expect(currentURL()).to.contains('/envoi-profil');
    });

  });

  context('When user is logged', async function() {

    context('When user has seen send profile page but has not send it', async function() {

      it('should redirect directly to send profile page', async function() {
        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains('/envoi-profil');
      });
    });

    context('When user has already send his profile', async function() {

      it('should redirect directly to send already sent page', async function() {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // when
        await visit(`/campagnes/${campaign.code}`);

        // then
        expect(currentURL()).to.contains('/deja-envoye');
      });

      it('should display profile card and pix score', async function() {
        // given
        await completeCampaignOfTypeProfilesCollectionByCode(campaign.code);

        // then
        expect(contains('156')).to.exist;
        expect(contains('Area_1_title')).to.exist;
        expect(contains('Area_1_Competence_1_name')).to.exist;
      });
    });
  });
});
