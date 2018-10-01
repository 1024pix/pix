import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';
import { invalidateSession } from 'mon-pix/tests/helpers/ember-simple-auth';

describe('Acceptance | Campaigns | Resume Campaigns', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Resume a campaigns course', function() {

    beforeEach(async function() {
      authenticateAsSimpleUser();
      await visit('/campagnes/codecampagnepix');
      await click('.campaign-landing-page__start-button');
      await click('.challenge-actions__action-skip');
    });

    context('When user had started a campaign and he is not logged anymore', function() {

      beforeEach(async function() {
        invalidateSession(application);
      });

      it('should propose to reconnect', async function() {
        // given
        await visit('/campagnes/codecampagnepix');
        await click('.campaign-landing-page__start-button');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/connexion');
        });
      });

      it('should connect and redirect in assessment when we enter URL', async function() {
        // given
        await visit('/campagnes/codecampagnepix');
        await click('.campaign-landing-page__start-button');

        fillIn('#pix-email', 'jane@acme.com');
        fillIn('#pix-password', 'Jane1234');

        // when
        click('.signin-form__submit_button');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments/');
          expect(find('.progress-bar-info').text()).to.contains('2 / 5');
        });
      });

    });

    context('When user had started a campaign and she retry the starter URL', async function() {

      it('should redirect directly in assessment when we enter URL', async function() {
        // given
        await visit('/compte');
        await visit('/campagnes/codecampagnepix');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments/');
          expect(find('.progress-bar-info').text()).to.contains('2 / 5');
        });
      });
    });

    context('When user had finished the campaign', function() {
      beforeEach(async function() {
        await visit('/campagnes/codecampagnepix');
        await click('.challenge-actions__action-skip');
        await click('.challenge-item-warning__confirm-btn');
        await click('.challenge-actions__action-skip');
      });

      it('should show the result page', async function() {
        // given
        await visit('/compte');

        await visit('/campagnes/codecampagnepix');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('checkpoint');
        });
      });

    });
  });
});
