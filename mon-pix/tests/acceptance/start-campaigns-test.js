import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Campaigns | Start Campaigns', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Start a campaigns course', function() {

    context('When user is not logged in', function() {

      beforeEach(async function() {
        await visit('/campagnes/AZERTY1');
      });

      it('should redirect to login page when user start', async function() {
        await click('.campaign-landing-page__start-button');

        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/connexion');
        });
      });

      context('When campaign have external identifiant', function() {

        it('should redirect to fill-in-id-pix page after connexion', async function() {
          await click('.campaign-landing-page__start-button');

          // when
          expect(currentURL()).to.equal('/connexion');
          fillIn('#pix-email', 'jane@acme.com');
          fillIn('#pix-password', 'Jane1234');
          await click('.signin-form__submit_button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });
        });

        it('should redirect to assessment after completion of external id', async function() {
          await click('.campaign-landing-page__start-button');

          // when
          expect(currentURL()).to.equal('/connexion');
          fillIn('#pix-email', 'jane@acme.com');
          fillIn('#pix-password', 'Jane1234');
          await click('.signin-form__submit_button');

          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.pix-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/assessment');
          });
        });
      });

    });

    context('When user is logged in', async function() {

      beforeEach(function() {
        authenticateAsSimpleUser();
      });

      it('should redirect directly in campaigns', async function() {
        // then
        await visit('/campagnes/AZERTY1');

        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
          expect(find('.campaign-landing-page__start-button').text().trim()).to.equal('Je commence');
        });
      });

      context('When campaign have external identifiant', function() {

        beforeEach(async function() {
          await visit('/campagnes/AZERTY1');
        });

        it('should show the fill-in-id-pix page after clicking "I start" button', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });
        });

        it('should go to the assessment when the user complete his identifiant', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.pix-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains(/assessments/);
            expect(find('.course-banner__name').text()).to.equal('');
            findWithAssert('.assessment-challenge__progress-bar');

          });
        });
      });

      context('When campaign does not have external identifiant', function() {

        beforeEach(async function() {
          await visit('/campagnes/AZERTY2');
        });

        it('should redirect to assessment after clicking to start button', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/assessment');
          });
        });
      });

      context('When campaign does not exist', function() {
        beforeEach(async function() {
          await visit('/campagnes/codefaux');
        });

        it('should show an error message', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.equal('/campagnes/codefaux');
            expect(find('.pix-panel').text()).to.contains('La campagne demandée n\'existe pas.');
          });
        });
      });

    });

  });
});
