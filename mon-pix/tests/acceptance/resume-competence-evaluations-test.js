import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import { authenticateAsSimpleUser } from '../helpers/testing';
import defaultScenario from '../../mirage/scenarios/default';

describe('Acceptance | Competence Evaluations | Resume Competence Evaluations', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    defaultScenario(server);
  });

  afterEach(function() {
    destroyApp(application);
  });

  describe('Resume a competence evaluation', function() {

    context('When user is not logged in', function() {

      beforeEach(async function() {
        await visit('/competences/1/evaluer');
      });

      it('should redirect to signin page', async function() {
        // then
        return andThen(() => {
          expect(currentURL()).to.equal('/connexion');
        });
      });

      it('should redirect to assessment after signin', async function() {
        // when
        await fillIn('#email', 'jane@acme.com');
        await fillIn('#password', 'Jane1234');
        await click('.button');

        // then
        return andThen(() => {
          expect(currentURL()).to.contains('/assessments');
        });
      });

    });

    context('When user is logged in', function() {
      beforeEach(async function() {
        await authenticateAsSimpleUser();
      });

      context('When competence evaluation exists', function() {

        beforeEach(async function() {
          await visit('/competences/1/evaluer');
        });

        it('should redirect to assessment', async function() {
          // then
          expect(currentURL()).to.contains(/assessments/);
          expect(find('.course-banner__name').text()).to.equal('');
          findWithAssert('.assessment-challenge__progress-bar');
        });
      });

      context('When competence evaluation does not exist', function() {
        beforeEach(async function() {
          await visit('/competences/wrongId123');
        });

        it('should show an error message', async function() {
          // then
          return andThen(() => {
            expect(currentURL()).to.equal('/compte');
          });
        });
      });

    });

  });
});
