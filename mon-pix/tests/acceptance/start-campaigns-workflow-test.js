/* eslint ember/no-classic-classes: 0 */

import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';

import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'ember-cli-mirage';

import visit from '../helpers/visit';
import { contains } from '../helpers/contains';
import { clickByLabel } from '../helpers/click-by-label';
import sinon from 'sinon';
import Service from '@ember/service';

import { authenticateByEmail, authenticateByGAR } from '../helpers/authentication';
import { startCampaignByCode, startCampaignByCodeAndExternalId } from '../helpers/campaign';
import { currentSession } from 'ember-simple-auth/test-support';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

describe('Acceptance | Campaigns | Start Campaigns workflow', function() {

  setupApplicationTest();
  setupMirage();

  let campaign;

  beforeEach(function() {
    this.server.schema.students.create({
      firstName: 'JeanPrescrit',
      lastName: 'Campagne',
      username: '',
      userId: null,
      organizationId: null,
      studentNumber: '123A',
    });

    this.server.schema.users.create({
      mustValidateTermsOfService: true,
    });
  });

  describe('Start a campaign', function() {
    let prescritUser;

    beforeEach(function() {
      prescritUser = server.create('user', 'withEmail', {
        mustValidateTermsOfService: false,
        lastTermsOfServiceValidatedAt: null,
      });
    });

    context('When user is not logged in', function() {

      context('When user has not given any campaign code', function() {

        it('should access campaign form page', async function() {
          // when
          await visit('/campagnes');

          // then
          expect(find('.fill-in-campaign-code__start-button').textContent).to.contains('Commencer');
        });

        context('When is a simplified access campaign', function() {

          beforeEach(function() {
            campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
          });

          it('should redirect to landing page', async function() {
            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          it('should redirect to tutorial page after starting campaign', async function() {
            // when
            await visit(`/campagnes/${campaign.code}`);
            await click('button[type="submit"]');
            await fillIn('#id-pix-label', 'vu');
            await click('button[type="submit"]');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });

      context('When campaign code exists', function() {

        context('When campaign is not restricted', function() {

          it('should access presentation page', async function() {
            // given
            const campaign = server.create('campaign', { isRestricted: false });
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            // then
            expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/presentation`.toLowerCase());
          });

          context('When user create its account', function() {

            it('should send campaignCode to API', async function() {

              let sentCampaignCode;

              const prescritUser = {
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'firstName.lastName@email.com',
                password: 'Pix12345',
              };

              this.server.post('/users', (schema, request) => {
                sentCampaignCode = (JSON.parse(request.requestBody)).meta['campaign-code'];
                return schema.users.create({});
              }, 201);

              // given
              const campaign = server.create('campaign', { isRestricted: false });
              await visit('/campagnes');
              await fillIn('#campaign-code', campaign.code);
              await click('.fill-in-campaign-code__start-button');
              expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/presentation`.toLowerCase());
              await click('.campaign-landing-page__start-button');
              expect(currentURL().toLowerCase()).to.equal('/inscription'.toLowerCase());
              await fillIn('#firstName', prescritUser.firstName);
              await fillIn('#lastName', prescritUser.lastName);
              await fillIn('#email', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click('#pix-cgu');

              // when
              await click('.button');

              // then
              expect(sentCampaignCode).to.equal(campaign.code);
            });
          });

        });

        context('When campaign is restricted and SCO', function() {

          beforeEach(function() {
            campaign = server.create('campaign', { isRestricted: true, organizationType: 'SCO' });
          });

          context('When the student has an account but is not reconciled', function() {

            it('should redirect to reconciliation page', async function() {
              // given
              await visit('/campagnes');

              // when
              await fillIn('#campaign-code', campaign.code);
              await click('.fill-in-campaign-code__start-button');
              await click('#login-button');
              await fillIn('#login', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click('#submit-connexion');

              // then
              expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`.toLowerCase());
            });

            context('When student is reconciled in another organization', function() {

              it('should reconcile and redirect to landing-page', async function() {
                // given
                server.get('schooling-registration-user-associations', () => {
                  return { data: null };
                });
                server.create('schooling-registration-user-association', {
                  campaignCode: campaign.code,
                });
                await visit('/campagnes');

                // when
                await fillIn('#campaign-code', campaign.code);
                await click('.fill-in-campaign-code__start-button');
                await click('#login-button');
                await fillIn('#login', prescritUser.email);
                await fillIn('#password', prescritUser.password);
                await click('#submit-connexion');

                // then
                expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/presentation`.toLowerCase());
              });
            });
          });

          context('When user must accept Pix last terms of service', async function() {

            it('should redirect to campaign landing page after accept terms of service', async function() {
              // given
              await visit('/campagnes');
              prescritUser.mustValidateTermsOfService = true;
              await fillIn('#campaign-code', campaign.code);
              await click('.fill-in-campaign-code__start-button');
              await click('#login-button');
              await fillIn('#login', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click('#submit-connexion');

              // when
              await click('#pix-cgu');
              await click('.terms-of-service-form-actions__submit');

              // then
              expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`.toLowerCase());

            });
          });

          it('should redirect to login-or-register page', async function() {
            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/identification`);
          });

          it('should redirect to landing page when reconciliation and registration are done', async function() {
            // given
            this.server.put('schooling-registration-user-associations/possibilities', () => {

              const studentFoundWithUsernameGenerated = {
                'data': {
                  'attributes': {
                    'last-name': 'JeanPrescrit',
                    'first-name': 'Campagne',
                    'birthdate': '2010-12-10',
                    'campaign-code': 'RESTRICTD',
                    'username': 'jeanprescrit.campagne1012',
                  }, 'type': 'schooling-registration-user-associations',
                },
              };

              return new Response(200, {}, studentFoundWithUsernameGenerated);
            });

            await visit(`/campagnes/${campaign.code}`);

            // when
            await fillIn('#firstName', 'JeanPrescrit');
            await fillIn('#lastName', 'Campagne');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('#submit-search');

            await fillIn('#password', 'Password123');
            await click('#submit-registration');

            // then
            expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/presentation`.toLowerCase());
          });

          it('should not alter inputs(username,password,email) when email already exists ', async function() {

            //given
            this.server.put('schooling-registration-user-associations/possibilities', () => {

              const studentFoundWithUsernameGenerated = {
                'data': {
                  'attributes': {
                    'last-name': 'last',
                    'first-name': 'first',
                    'birthdate': '2010-10-10',
                    'campaign-code': 'RESTRICTD',
                    'username': 'first.last1010',
                  }, 'type': 'schooling-registration-user-associations',
                },
              };

              return new Response(200, {}, studentFoundWithUsernameGenerated);
            });

            this.server.post('schooling-registration-dependent-users', () => {

              const emailAlreadyExistResponse = {
                'errors': [{
                  'status': '422',
                  'title': 'Invalid data attribute "email"',
                  'detail': 'Cette adresse e-mail est déjà enregistrée, connectez-vous.',
                  'source': { 'pointer': '/data/attributes/email' },
                }],
              };

              return new Response(422, {}, emailAlreadyExistResponse);
            });

            await visit(`/campagnes/${campaign.code}`);

            // when
            await fillIn('#firstName', prescritUser.firstName);
            await fillIn('#lastName', prescritUser.lastName);
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await click('#submit-search');
            //go to email-based authentication window
            await click('.pix-toggle__off');

            await fillIn('#email', prescritUser.email);
            await fillIn('#password', 'pix123');
            await click('#submit-registration');
            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/identification`);
            expect(find('#firstName').value).to.equal(prescritUser.firstName);
            expect(find('#email').value).to.equal(prescritUser.email);
            expect(find('#password').value).to.equal('pix123');

            //go to username-based authentication window
            await click('.pix-toggle__off');
            expect(find('span[data-test-username]').textContent).to.equal('first.last1010');
            expect(find('#password').value).to.equal('pix123');

          });

          it('should redirect to join restricted campaign page when connection is done', async function() {
            // given
            await visit(`/campagnes/${campaign.code}`);
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/identification`);

            // when
            await click('#login-button');
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`);
          });

          it('should redirect to landing page when fields are filled in and associate button is clicked', async function() {
            // given
            await visit(`/campagnes/${campaign.code}`);
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/identification`);

            await click('#login-button');
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`);
            // when
            await fillIn('#firstName', 'Jane');
            await fillIn('#lastName', 'Acme');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await click('.button');

            await click('button[aria-label="Associer"]');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

        });

        context('When campaign is restricted and SUP', function() {

          beforeEach(function() {
            campaign = server.create('campaign', { isRestricted: true, organizationType: 'SUP' });
          });

          it('should redirect to simple login page', async function() {
            // given
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            // then
            expect(currentURL()).to.equal('/inscription');
          });

          it('should be redirect to join page after login', async () => {
            // given
            await visit(`/campagnes/${campaign.code}`);
            // when
            await clickByLabel('connectez-vous à votre compte');
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);

            await clickByLabel('Je me connecte');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`);
          });
        });

        context('When campaign belongs to Pole Emploi organization', function() {

          let replaceLocationStub;

          beforeEach(function() {
            replaceLocationStub = sinon.stub().resolves();
            this.owner.register('service:location', Service.extend({
              replace: replaceLocationStub,
            }));
            campaign = server.create('campaign', { organizationIsPoleEmploi: true });
          });

          it('should redirect to Pole Emploi authentication form', async function() {
            // given
            await visit('/campagnes');

            // when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            // then
            sinon.assert.called(replaceLocationStub);
            expect(currentURL()).to.equal('/connexion-pole-emploi');
          });

          it('should redirect to landing page once user is authenticated', async function() {
            // given
            const state = 'state';

            const session = currentSession();
            session.set('data.state', state);
            session.set('data.nextURL', `/campagnes/${campaign.code}`);

            // when
            await visit(`/connexion-pole-emploi?code=test&state=${state}`);

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          context('When user must validate terms of service Pole Emploi', function() {

            const authenticationKey = 'authenticationKey';

            beforeEach(function() {
              server.post('/pole-emploi/token', () => {

                const userAccountNotFoundForPoleEmploiError = {
                  'errors': [{
                    'status': '401',
                    'code': 'SHOULD_VALIDATE_CGU',
                    'title': 'Unauthorized',
                    'detail': 'L\'utilisateur n\'a pas de compte Pix',
                    'meta': { authenticationKey },
                  }],
                };

                return new Response(401, {}, userAccountNotFoundForPoleEmploiError);
              });
            });

            it('should redirect to terms of service Pole Emploi page', async function() {
              // given
              const state = 'state';
              const session = currentSession();
              session.set('data.state', state);

              // when
              await visit(`/connexion-pole-emploi?code=test&state=${state}`);

              // then
              expect(currentURL()).to.equal(`/cgu-pole-emploi?authenticationKey=${authenticationKey}`);
            });
          });
        });

        context('When is a simplified access campaign', function() {

          beforeEach(function() {
            campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
          });

          it('should redirect to landing page', async function() {
            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          it('should redirect to tutorial page after starting campaign', async function() {
            // when
            await visit(`/campagnes/${campaign.code}`);
            await click('button[type="submit"]');
            await fillIn('#id-pix-label', 'vu');
            await click('button[type="submit"]');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/didacticiel`);
          });
        });
      });

      context('When campaign code does not exist', function() {

        it('should display an error message on fill-in-campaign-code page', async function() {
          // given
          const campaignCode = 'NONEXISTENT';
          await visit('/campagnes');

          // when
          await fillIn('#campaign-code', campaignCode);
          await click('.fill-in-campaign-code__start-button');

          // then
          expect(currentURL()).to.equal('/campagnes');
          expect(find('.fill-in-campaign-code__error').textContent)
            .to.contains('Votre code est erroné, veuillez vérifier ou contacter l’organisateur.');
        });
      });

      context('When user validates with empty campaign code', function() {

        it('should display an error', async function() {
          // given
          await visit('/campagnes');

          // when
          await click('.fill-in-campaign-code__start-button');

          // then
          expect(currentURL()).to.equal('/campagnes');
          expect(find('.fill-in-campaign-code__error').textContent).to.contains('Veuillez saisir un code.');
        });
      });

      context('When the user has already seen the landing page', function() {
        beforeEach(async function() {
          const campaign = server.create('campaign');
          await startCampaignByCode(campaign.code);
        });

        it('should redirect to signin page', async function() {
          // then
          expect(currentURL()).to.equal('/inscription');
        });
      });

      context('When the user has not seen the landing page', function() {
        it('should redirect to landing page', async function() {
          // when
          const campaign = server.create('campaign');
          await visit(`/campagnes/${campaign.code}`);

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
        });

        context('When campaign has custom text for the landing page', function() {
          it('should show the custom text on the landing page', async function() {
            // given
            const campaign = server.create('campaign', { customLandingPageText: 'SomeText' });

            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(find('.campaign-landing-page__start__custom-text')).to.exist;
            expect(find('.campaign-landing-page__start__custom-text').textContent).to.contains(campaign.customLandingPageText);
          });
        });

        context('When campaign does not have custom text for the landing page', function() {
          it('should show only the defaulted text on the landing page', async function() {
            // when
            const campaign = server.create('campaign', { customLandingPageText: null });
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(find('.campaign-landing-page__start__custom-text')).to.not.exist;
          });
        });

      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            campaign = server.create('campaign', { idPixLabel: 'email' });
            await startCampaignByCode(campaign.code);
            await fillIn('#firstName', prescritUser.firstName);
            await fillIn('#lastName', prescritUser.lastName);
            await fillIn('#email', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#pix-cgu');
            await click('.button');
          });

          it('should redirect to fill-in-participant-external-id page after signup', async function() {
            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });
        });

        context('When participant external id is set in the url', function() {

          context('When campaign is not restricted', function() {
            beforeEach(async function() {
              campaign = server.create('campaign', { isRestricted: false, idPixLabel: 'toto' });
              await startCampaignByCodeAndExternalId(campaign.code);
              await fillIn('#firstName', prescritUser.firstName);
              await fillIn('#lastName', prescritUser.lastName);
              await fillIn('#email', prescritUser.email);
              await fillIn('#password', prescritUser.password);
              await click('#pix-cgu');
              await click('.button');
            });

          });
        });
      });

      context('When campaign does not have external id', function() {
        beforeEach(async function() {
          campaign = server.create('campaign', { idPixLabel: null });
          await startCampaignByCode(campaign.code);
          await fillIn('#firstName', prescritUser.firstName);
          await fillIn('#lastName', prescritUser.lastName);
          await fillIn('#email', prescritUser.email);
          await fillIn('#password', prescritUser.password);
          await click('#pix-cgu');
          await click('.button');
        });
      });
    });

    context('When user is logged in', function() {
      beforeEach(async function() {
        await authenticateByEmail(prescritUser);
      });

      context('When campaign is not restricted', function() {
        it('should redirect to landing page', async function() {
          // given
          campaign = server.create('campaign');

          // when
          await visit(`/campagnes/${campaign.code}`);

          //then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
        });
      });

      context('When campaign is restricted and SCO', function() {

        beforeEach(function() {
          campaign = server.create('campaign', { isRestricted: true, idPixLabel: 'nom de naissance de maman', organizationType: 'SCO' });
        });

        context('When association is not already done', function() {

          it('should try to reconcile automatically before redirect to join restricted campaign page', async function() {
            // given
            server.get('schooling-registration-user-associations', () => {
              return { data: null };
            });
            server.create('schooling-registration-user-association', {
              campaignCode: campaign.code,
            });

            // when
            await visit(`/campagnes/${campaign.code}`);

            // then
            expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/presentation`.toLowerCase());
          });

          it('should redirect to join restricted campaign page when campaign code is in url', async function() {
            // when
            await visit(`/campagnes/${campaign.code}`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`);
            expect(find('.join-restricted-campaign')).to.exist;
          });

          it('should redirect to join restricted campaign page', async function() {
            // given
            await visit('/campagnes');

            //when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            //then
            expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`.toLowerCase());
            expect(find('.join-restricted-campaign')).to.exist;
          });

          it('should not set any field by default', async function() {
            // when
            await visit(`/campagnes/${campaign.code}/privee/rejoindre`);

            //then
            expect(find('#firstName').value).to.equal('');
            expect(find('#lastName').value).to.equal('');
          });

          it('should redirect to landing page when fields are filled in and associate button is clicked', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/privee/rejoindre`);

            // when
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');

            await click('.button');

            await click('button[aria-label="Associer"]');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          it('should redirect to fill-in-participant-external-id page', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/privee/rejoindre`);
            await fillIn('#firstName', 'Robert');
            await fillIn('#lastName', 'Smith');
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');
            await click('button[aria-label="Associer"]');

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });

        });

        context('When association is already done', function() {

          beforeEach(async function() {
            server.create('schooling-registration-user-association', {
              campaignCode: campaign.code,
            });
          });

          it('should redirect to landing page', async function() {
            // when
            await visit(`/campagnes/${campaign.code}/privee/rejoindre`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          it('should redirect to fill-in-participant-external-id page', async function() {
            // given
            await visit(`/campagnes/${campaign.code}/privee/rejoindre`);

            // when
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });
        });
      });

      context('When campaign is restricted and SUP', function() {

        beforeEach(function() {
          campaign = server.create('campaign', { isRestricted: true, organizationType: 'SUP' });
        });

        it('should be redirected to join page', async () => {
          // when
          await visit(`/campagnes/${campaign.code}`);
          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`);
        });

        it('the student has been associated with its student number', async () => {
          // given
          await visit(`/campagnes/${campaign.code}`);

          // when
          await click('#no-student-number');
          await fillIn('#firstName', 'Jean');
          await fillIn('#lastName', 'Bon');
          await fillIn('#dayOfBirth', '01');
          await fillIn('#monthOfBirth', '01');
          await fillIn('#yearOfBirth', '2000');
          await clickByLabel('C\'est parti !');

          // then
          expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/presentation`.toLowerCase());
        });
      });

      context('When campaign has external id', function() {

        context('When participant external id is not set in the url', function() {

          beforeEach(async function() {
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman' });
            await startCampaignByCode(campaign.code);
          });

          it('should show the identifiant page after clicking on start button in landing page', async function() {
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/identifiant`);
          });
        });

        context('When participant external id is set in the url', function() {
          beforeEach(async function() {
            campaign = server.create('campaign', { idPixLabel: 'nom de naissance de maman' });
            await startCampaignByCodeAndExternalId(campaign.code);
          });

        });
      });

      context('When campaign does not have external id', function() {

        beforeEach(async function() {
          campaign = server.create('campaign', { idPixLabel: null });
          await visit(`campagnes/${campaign.code}`);
        });
      });

      context('When campaign does not have external id but a participant external id is set in the url', function() {
        beforeEach(async function() {
          campaign = server.create('campaign', { idPixLabel: null });
          await visit(`/campagnes/${campaign.code}?participantExternalId=a73at01r3`);
        });

      });

      context('When campaign does not exist', function() {
        beforeEach(async function() {
          await visit('/campagnes/codefaux');
        });

        it('should show an error message', async function() {
          // then
          expect(currentURL()).to.equal('/campagnes/codefaux');
          expect(find('.title').textContent).to.contains('Oups, la page demandée n’est pas accessible.');
        });
      });

      context('When is a simplified access campaign', function() {

        beforeEach(function() {
          campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
        });

        it('should redirect to landing page', async function() {
          // when
          await visit(`/campagnes/${campaign.code}`);

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
        });

        it('should redirect to tutorial page after starting campaign', async function() {
          // when
          await visit(`/campagnes/${campaign.code}`);
          await click('button[type="submit"]');
          await fillIn('#id-pix-label', 'vu');
          await click('button[type="submit"]');

          // then
          expect(currentURL()).to.equal(`/campagnes/${campaign.code}/evaluation/didacticiel`);
        });

      });
    });

    context('When user is logged as anonymous and campaign is simplified access', function() {

      beforeEach(async () => {
        campaign = server.create('campaign', { isSimplifiedAccess: true, idPixLabel: 'Les anonymes' });
        await currentSession().authenticate('authenticator:anonymous', { campaignCode: campaign.code });
      });

      it('should replace previous connected anonymous user', async function() {
        // given
        const session = currentSession();
        const previousUserId = session.data.authenticated['user_id'];

        // when
        await visit('/campagnes');
        await fillIn('#campaign-code', campaign.code);
        await click('.fill-in-campaign-code__start-button');
        await click('button[type="submit"]');

        const currentUserId = session.data.authenticated['user_id'];

        // then
        expect(currentUserId).to.be.finite;
        expect(previousUserId).not.to.equal(currentUserId);
      });
    });

    context('When user is logged in an external platform', function() {

      context('When campaign is restricted and SCO', function() {
        beforeEach(function() {
          campaign = server.create('campaign', { isRestricted: true, organizationType: 'SCO' });
        });

        context('When association is not already done and reconciliation token is provided', function() {

          beforeEach(async function() {
            const externalUserToken = 'aaa.' + btoa('{"first_name":"JeanPrescrit","last_name":"Campagne","saml_id":"SamlId","source":"external","iat":1545321469,"exp":4702193958}') + '.bbb';
            await visit(`/campagnes?externalUser=${externalUserToken}`);
          });

          it('should redirect to reconciliation form', async function() {
            // when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/privee/rejoindre`);
          });

          it('should set by default firstName and lastName', async function() {
            // when
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            //then
            expect(find('#firstName').value).to.equal('JeanPrescrit');
            expect(find('#lastName').value).to.equal('Campagne');
          });

          it('should redirect to landing page when fields are filled in', async function() {
            // given
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            // when
            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });
        });

        context('When association is already done and user is created', function() {

          let garUser;

          beforeEach(async function() {
            garUser = server.create('user', AUTHENTICATED_SOURCE_FROM_MEDIACENTRE);
            await authenticateByGAR(garUser);
            server.create('schooling-registration-user-association', {
              campaignCode: campaign.code,
            });
          });

          it('should redirect to landing page', async function() {
            // when
            await visit(`/campagnes/${campaign.code}/privee/rejoindre`);

            //then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
          });

          context('When user is already reconciled in another organization', async function() {

            it('should reconcile and redirect to landing-page', async function() {
              // given
              server.get('schooling-registration-user-associations', () => {
                return { data: null };
              });
              server.create('schooling-registration-user-association', {
                campaignCode: campaign.code,
              });
              await visit('/campagnes');

              // when
              await fillIn('#campaign-code', campaign.code);
              await click('.fill-in-campaign-code__start-button');

              // then
              expect(currentURL().toLowerCase()).to.equal(`/campagnes/${campaign.code}/presentation`.toLowerCase());
            });
          });
        });

        context('When user is already reconciled and has no GAR authentication method yet', function() {

          const externalUserToken = 'aaa.' + btoa('{"first_name":"JeanPrescrit","last_name":"Campagne","saml_id":"SamlId","source":"external","iat":1545321469,"exp":4702193958}') + '.bbb';

          beforeEach(async function() {
            server.post('/schooling-registration-dependent-users/external-user-token', async () => {
              return new Response(409, {}, {
                errors: [{
                  status: '409',
                  code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
                  title: 'Conflict',
                  detail: 'Un compte existe déjà pour l\'élève dans le même établissement.',
                  meta: {
                    shortCode: 'R31',
                    value: 'u***@example.net',
                    userId: 1,
                  },
                }],
              });
            });

            await visit(`/campagnes?externalUser=${externalUserToken}`);
          });

          it('should land on start campaign page if GAR authentication method has been added', async () => {
            // given
            server.create('schooling-registration-user-association', {
              campaignCode: campaign.code,
            });
            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            await click('button[aria-label="Continuer avec mon compte Pix"]');

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            const session = currentSession();
            expect(session.data.authenticated.source).to.equal(AUTHENTICATED_SOURCE_FROM_MEDIACENTRE);

            // then
            expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
            expect(contains('Commencez votre parcours')).to.exist;
          });

          it('should display an specific error message if GAR authentication method adding has failed with http statusCode 4xx', async () => {
            // given
            const expectedErrorMessage = 'Les données que vous avez soumises ne sont pas au bon format.';
            const errorsApi = new Response(400, {}, {
              errors: [{ status: 400 }],
            });
            server.post('/token-from-external-user', () => errorsApi);

            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            await click('button[aria-label="Continuer avec mon compte Pix"]');

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            expect(currentURL()).to.contains(`/campagnes/${campaign.code}/privee/identification`);
            expect(find('#update-form-error-message').textContent).to.equal(expectedErrorMessage);
          });

          it('should display an specific error message if GAR authentication method adding has failed due to wrong connected account', async () => {
            // given
            const expectedErrorMessage = 'L\'adresse e-mail ou l\'identifiant est incorrect. Pour continuer, vous devez vous connecter à votre compte qui est sous la forme : ';
            const expectedObfuscatedConnectionMethod = 't***@example.net';
            const errorsApi = new Response(409, {}, {
              errors: [{
                status: 409,
                code: 'UNEXPECTED_USER_ACCOUNT',
                meta: { value: expectedObfuscatedConnectionMethod },
              }],
            });
            server.post('/token-from-external-user', () => errorsApi);

            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            await click('button[aria-label="Continuer avec mon compte Pix"]');

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            expect(currentURL()).to.contains(`/campagnes/${campaign.code}/privee/identification`);
            expect(find('#update-form-error-message').textContent).to.equal(expectedErrorMessage + expectedObfuscatedConnectionMethod);
          });

          it('should display the default error message if GAR authentication method adding has failed with others http statusCode', async () => {
            // given
            const expectedErrorMessage = 'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.';
            server.post('/token-from-external-user', () => new Response(500));

            await fillIn('#campaign-code', campaign.code);
            await click('.fill-in-campaign-code__start-button');

            await fillIn('#dayOfBirth', '10');
            await fillIn('#monthOfBirth', '12');
            await fillIn('#yearOfBirth', '2000');
            await click('.button');

            await click('button[aria-label="Continuer avec mon compte Pix"]');

            // when
            await fillIn('#login', prescritUser.email);
            await fillIn('#password', prescritUser.password);
            await click('#submit-connexion');

            // then
            expect(currentURL()).to.contains(`/campagnes/${campaign.code}/privee/identification`);
            expect(find('#update-form-error-message').textContent).to.equal(expectedErrorMessage);
          });

          context('When user should change password', function() {

            it('should land on start campaign page after updating password expired', async function() {

              // given
              const userShouldChangePassword = server.create('user', 'withUsername', 'shouldChangePassword');

              server.post('/schooling-registration-dependent-users/external-user-token', async () => {
                return new Response(409, {}, {
                  errors: [{
                    status: '409',
                    code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
                    title: 'Conflict',
                    detail: 'Un compte existe déjà pour l\'élève dans le même établissement.',
                    meta: {
                      shortCode: 'R32',
                      value: 'u***.y***1989',
                      userId: 1,
                    },
                  }],
                });
              });

              server.create('schooling-registration-user-association', {
                campaignCode: campaign.code,
              });

              // when
              await fillIn('#campaign-code', campaign.code);
              await click('.fill-in-campaign-code__start-button');

              await fillIn('#dayOfBirth', '10');
              await fillIn('#monthOfBirth', '12');
              await fillIn('#yearOfBirth', '2000');
              await click('.button');
              await click('button[aria-label="Continuer avec mon compte Pix"]');
              await fillIn('#login', userShouldChangePassword.username);
              await fillIn('#password', userShouldChangePassword.password);
              await click('#submit-connexion');

              // then
              expect(currentURL()).to.equal('/mise-a-jour-mot-de-passe-expire');

              // when
              await fillIn('#password', 'newPass12345!');
              await click('.button');

              // then
              expect(currentURL()).to.equal(`/campagnes/${campaign.code}/presentation`);
              expect(contains('Commencez votre parcours')).to.exist;
            });
          });
        });
      });
    });
  });
});
