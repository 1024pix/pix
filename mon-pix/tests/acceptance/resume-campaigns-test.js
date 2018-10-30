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
      await authenticateAsSimpleUser();
      await visit('/campagnes/AZERTY1');
      await click('.campaign-landing-page__start-button');
      await fillIn('#id-pix-label', 'monmail@truc.fr');
      await click('.pix-button');
      await click('.challenge-actions__action-skip');
    });

    context('When user has started a campaign and he is not logged anymore', function() {

      beforeEach(async function() {
        invalidateSession(application);
        await visit('/campagnes/AZERTY2');
        await click('.campaign-landing-page__start-button');
      });

      it('should propose to reconnect', async function() {
        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/connexion');
        });
      });

      it('should connect and redirect in assessment when we enter URL', async function() {
        // given
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

    context('When user has started a campaign and he enters campaign URL', async function() {

      it('should redirect directly in assessment', async function() {
        // given
        await visit('/campagnes/AZERTY2');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments/');
          expect(find('.progress-bar-info').text()).to.contains('2 / 5');
        });
      });
    });

    context('When user has finished the campaign', function() {
      beforeEach(async function() {
        await click('.challenge-actions__action-skip');
        await click('.challenge-item-warning__confirm-btn');
        await click('.challenge-actions__action-skip');
      });

      it('should show the result page', async function() {
        // when
        await visit('/campagnes/AZERTY1');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('resultats');
        });
      });

      context('When user has not shared his results', function() {

        it('should suggest to share his results', async function() {
          // when
          await visit('/campagnes/AZERTY1');

          // then
          return andThen(() => {
            findWithAssert('.skill-review__share__button');
          });
        });

        it('should thank the user for sharing his results since he has already shared it', async function() {
          // given
          await visit('/campagnes/AZERTY1');
          await click('.skill-review__share__button');

          // when
          await visit('/campagnes/AZERTY1');

          // then
          return andThen(() => {
            findWithAssert('.skill-review__share__thanks');
          });
        });
      });

    });
  });
})
;
