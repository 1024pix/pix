import { click, fillIn, currentURL, find, visit } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateByEmail } from '../helpers/authentication';
import { startCampaignByCode, startCampaignByCodeAndExternalId } from '../helpers/campaign';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';
import { clickByLabel } from '../helpers/click-by-label';
import findByLabel from '../helpers/find-by-label';
import setupIntl from '../helpers/setup-intl';

const PROFILES_COLLECTION = 'PROFILES_COLLECTION';

describe('Acceptance | Campaigns | Start Campaigns with type Profiles Collection', function () {
  setupApplicationTest();
  setupMirage();
  setupIntl();
  let campaign;

  beforeEach(function () {
    this.server.schema.students.create({
      firstName: 'JeanPrescrit',
      lastName: 'Campagne',
      username: '',
      userId: null,
      organizationId: null,
    });
  });

  describe('Start a campaign', function () {
    let campaignParticipant;

    beforeEach(function () {
      campaignParticipant = server.create('user', 'withEmail');
    });

    context('When user is not logged in', function () {
      context('When campaign has external id', function () {
        context('When participant external id is not set in the url', function () {
          beforeEach(async function () {
            campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: 'email' });
            await startCampaignByCode(campaign.code);
            await fillIn('#firstName', campaignParticipant.firstName);
            await fillIn('#lastName', campaignParticipant.lastName);
            await fillIn('#email', campaignParticipant.email);
            await fillIn('#password', campaignParticipant.password);
            await click('.signup-form__cgu');
            await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));
          });

          it('should redirect to send profile page after completion of external id', async function () {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await clickByLabel(this.intl.t('pages.fill-in-participant-external-id.buttons.continue'));

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });

        context('When participant external id is set in the url', function () {
          context('When campaign is not restricted', function () {
            beforeEach(async function () {
              campaign = server.create('campaign', {
                type: PROFILES_COLLECTION,
                isRestricted: false,
                idPixLabel: 'toto',
              });
              await startCampaignByCodeAndExternalId(campaign.code);
              await fillIn('#firstName', campaignParticipant.firstName);
              await fillIn('#lastName', campaignParticipant.lastName);
              await fillIn('#email', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click('.signup-form__cgu');
              await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));
            });

            it('should redirect to send profile page', async function () {
              // then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
            });
          });

          context('When campaign is restricted', function () {
            it('should redirect to send profile page', async function () {
              //given
              campaign = server.create('campaign', {
                type: PROFILES_COLLECTION,
                isRestricted: true,
                idPixLabel: 'toto',
                organizationType: 'SCO',
              });
              await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
              await clickByLabel("C'est parti !");

              // when
              await click('#login-button');

              await fillIn('#login', campaignParticipant.email);
              await fillIn('#password', campaignParticipant.password);
              await click('#submit-connexion');

              await fillIn('#firstName', campaignParticipant.firstName);
              await fillIn('#lastName', campaignParticipant.lastName);
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await clickByLabel(this.intl.t('pages.join.button'));
              await clickByLabel(this.intl.t('pages.join.sco.associate'));

              // then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
            });
          });
        });
      });

      context('When campaign does not have external id', function () {
        beforeEach(async function () {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          await startCampaignByCode(campaign.code);
          await fillIn('#firstName', campaignParticipant.firstName);
          await fillIn('#lastName', campaignParticipant.lastName);
          await fillIn('#email', campaignParticipant.email);
          await fillIn('#password', campaignParticipant.password);
          await click('.signup-form__cgu');
          await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));
        });

        it('should redirect to send profile page after signup', async function () {
          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      context('When campaign does not have external id but a participant external id is set in the url', function () {
        beforeEach(async function () {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          await startCampaignByCodeAndExternalId(campaign.code);
          await fillIn('#firstName', campaignParticipant.firstName);
          await fillIn('#lastName', campaignParticipant.lastName);
          await fillIn('#email', campaignParticipant.email);
          await fillIn('#password', campaignParticipant.password);
          await click('.signup-form__cgu');
          await clickByLabel(this.intl.t('pages.sign-up.actions.submit'));
        });

        it('should redirect to send profile page after signup', async function () {
          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });
    });

    context('When user is logged in', function () {
      beforeEach(async function () {
        await authenticateByEmail(campaignParticipant);
      });

      context('When campaign is not restricted', function () {
        it('should redirect to landing page', async function () {
          // when
          campaign = server.create('campaign', { type: PROFILES_COLLECTION });
          await visit(`/campagnes/${campaign.code}`);
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          expect(find('.campaign-landing-page__start-button').textContent.trim()).to.equal("C'est parti !");
        });
      });

      context('When campaign is restricted', function () {
        beforeEach(function () {
          campaign = server.create('campaign', {
            type: PROFILES_COLLECTION,
            isRestricted: true,
            idPixLabel: 'nom de naissance de maman',
            organizationType: 'SCO',
          });
        });

        context('When association is not already done', function () {
          it('should redirect to send profile page', async function () {
            // given
            await visit(`/campagnes/${campaign.code}`);
            await clickByLabel("C'est parti !");
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await clickByLabel(this.intl.t('pages.join.button'));
            await clickByLabel(this.intl.t('pages.join.sco.associate'));
            await fillIn('#id-pix-label', 'truc');

            // when
            await clickByLabel(this.intl.t('pages.fill-in-participant-external-id.buttons.continue'));

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });

          context('When user has already a reconciled account', function () {
            beforeEach(function () {
              server.post('/schooling-registration-user-associations', () => {
                return new Response(409, {}, { errors: [{ status: '409', meta: { shortCode: 'R11' } }] });
              });
            });

            it('should display error modal when fields are filled in', async function () {
              // given
              await visit(`/campagnes/${campaign.code}`);
              await clickByLabel("C'est parti !");

              // when
              await fillIn('#firstName', 'Robert');
              await fillIn('#lastName', 'Smith');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await clickByLabel(this.intl.t('pages.join.button'));

              //then
              expect(find('.join-error-modal')).to.exist;
            });

            it('should redirect to connection form when continue button is clicked', async function () {
              // given
              await visit(`/campagnes/${campaign.code}`);
              await clickByLabel("C'est parti !");

              // when
              await fillIn('#firstName', 'Robert');
              await fillIn('#lastName', 'Smith');
              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await clickByLabel(this.intl.t('pages.join.button'));
              await clickByLabel(this.intl.t('pages.join.sco.continue-with-pix'));

              //then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/rejoindre/identification`);
              expect(findByLabel('Se connecter')).to.exist;
            });
          });
        });
      });

      context('When campaign has external id', function () {
        context('When participant external id is not set in the url', function () {
          beforeEach(async function () {
            campaign = server.create('campaign', {
              type: PROFILES_COLLECTION,
              idPixLabel: 'nom de naissance de maman',
            });
            await startCampaignByCode(campaign.code);
          });

          it('should redirect to send profile page when the user fill in his id', async function () {
            // when
            await fillIn('#id-pix-label', 'monmail@truc.fr');
            await clickByLabel(this.intl.t('pages.fill-in-participant-external-id.buttons.continue'));

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });

        context('When participant external id is set in the url', function () {
          beforeEach(async function () {
            campaign = server.create('campaign', {
              type: PROFILES_COLLECTION,
              idPixLabel: 'nom de naissance de maman',
            });
            await startCampaignByCodeAndExternalId(campaign.code);
          });

          it('should redirect to send profile page', async function () {
            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
          });
        });
      });

      context('When campaign does not have external id', function () {
        beforeEach(async function () {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          await visit(`campagnes/${campaign.code}`);
        });

        it('should redirect to send profile page after clicking on start button in landing page', async function () {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });

      context('When campaign does not have external id but a participant external id is set in the url', function () {
        beforeEach(async function () {
          campaign = server.create('campaign', { type: PROFILES_COLLECTION, idPixLabel: null });
          await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
        });

        it('should redirect to send profile page after clicking on start button in landing page', async function () {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/collecte/envoi-profil`);
        });
      });
    });
  });
});
