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

      it('should redirect to landing page when user has not started his assessment yet', async function() {
        // when
        await visit('/campagnes/AZERTY1');

        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
        });
      });

      it('should redirect to login page once user has seen landing page', async function() {
        // given
        await visit('/campagnes/AZERTY1');

        //when
        await click('.campaign-landing-page__start-button');

        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/connexion');
        });
      });

      context('When campaign have external id', function() {

        beforeEach(async function() {
          await visit('/campagnes/AZERTY1');
          await click('.campaign-landing-page__start-button');
          await fillIn('#pix-email', 'jane@acme.com');
          await fillIn('#pix-password', 'Jane1234');
          await click('.signin-form__submit_button');
        });

        it('should redirect to fill-in-id-pix page after connexion', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });
        });

        it('should redirect to assessment after completion of external id', async function() {
          // when
          fillIn('#id-pix-label', 'monmail@truc.fr');
          await click('.pix-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains(/assessments/);
          });
        });
      });

      context('When campaign does not have external id', function() {
        beforeEach(async function() {
          await visit('/campagnes/AZERTY2');
          await click('.campaign-landing-page__start-button');
          fillIn('#pix-email', 'jane@acme.com');
          fillIn('#pix-password', 'Jane1234');
          await click('.signin-form__submit_button');
        });

        it('should redirect to assessment after connexion', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.contains(/assessments/);
          });
        });
      });

    });

    context('When user is logged in', function() {

      beforeEach(async function() {
        await authenticateAsSimpleUser();
      });

      it('should redirect to landing page', async function() {
        // when
        await visit('/campagnes/AZERTY1');

        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/campagnes/AZERTY1/presentation');
          expect(find('.campaign-landing-page__start-button').text().trim()).to.equal('Je commence');
        });
      });

      context('When campaign have external id', function() {

        beforeEach(async function() {
          await visit('/campagnes/AZERTY1');
        });

        it('should show the fill-in-id-pix page after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains('/campagnes/AZERTY1/identifiant');
          });
        });

        it('should go to the assessment when the user fill in his id', async function() {
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

      context('When campaign does not have external id', function() {

        beforeEach(async function() {
          await visit('/campagnes/AZERTY2');
        });

        it('should redirect to assessment after clicking on start button in landing page', async function() {
          // when
          await click('.campaign-landing-page__start-button');

          // then
          return andThen(() => {
            expect(currentURL()).to.contains(/assessments/);
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
