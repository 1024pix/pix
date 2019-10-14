import { click, fillIn, currentURL, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Competence Evaluations | Resume Competence Evaluations', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  describe('Resume a competence evaluation', function() {

    context('When user is not logged in', function() {

      beforeEach(async function() {
        await visitWithAbortedTransition('/competences/1/evaluer');
      });

      it('should redirect to signin page', async function() {
        expect(currentURL()).to.equal('/connexion');
      });

      it('should redirect to assessment after signin', async function() {
        // when
        await fillIn('#email', 'jane@acme.com');
        await fillIn('#password', 'Jane1234');
        await click('.button');

        expect(currentURL()).to.contains('/assessments');
      });

    });

    context('When user is logged in', function() {
      beforeEach(async function() {
        await authenticateAsSimpleUser();
      });

      context('When competence evaluation exists', function() {

        beforeEach(async function() {
          await visitWithAbortedTransition('/competences/1/evaluer');
        });

        it('should redirect to assessment', async function() {
          // then
          expect(currentURL()).to.contains(/assessments/);
          expect(find('.assessment-banner')).to.exist;
        });
      });

      context('When competence evaluation does not exist', function() {
        beforeEach(async function() {
          await visitWithAbortedTransition('/competences/wrongId/evaluer');
        });

        it('should show an error message', async function() {
          expect(find('.error-page__main-content')).to.exist;
        });
      });

    });

  });
});
