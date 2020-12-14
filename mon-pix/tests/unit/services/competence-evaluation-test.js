import { expect } from 'chai';
import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { reject } from 'rsvp';

describe('Unit | Service | competence-evaluation', function() {
  setupTest();
  let competenceEvaluationService;

  describe('#improve()', function() {
    const competenceId = 'recCompetenceId';
    const userId = 'userId';
    const scorecardId = 'scorecardId';
    let store, router;

    beforeEach(async function() {
      // given
      competenceEvaluationService = this.owner.lookup('service:competence-evaluation');
      store = Service.create({
        queryRecord: sinon.stub().resolves(),
        findRecord: sinon.stub().resolves(),
      });
      router = EmberObject.create({ transitionTo: sinon.stub() });
      competenceEvaluationService.set('router', router);
      competenceEvaluationService.set('store', store);
    });

    context('nominal case', function() {
      beforeEach(async function() {
        // when
        await competenceEvaluationService.improve({ userId, competenceId });
      });

      it('creates a competence-evaluation for improving', async function() {
        // then
        sinon.assert.calledWith(store.queryRecord, 'competence-evaluation', {
          improve: true,
          userId,
          competenceId,
        });
      });

      it('redirects to competences.resume route', async function() {
        // then
        sinon.assert.calledWith(router.transitionTo, 'competences.resume', competenceId);
      });
    });

    context('when improving fails with ImproveCompetenceEvaluationForbidden error', async function() {
      beforeEach(async function() {
        // given
        competenceEvaluationService = this.owner.lookup('service:competence-evaluation');
        store = Service.create({
          queryRecord: () => reject({ errors: [{ title: 'ImproveCompetenceEvaluationForbidden' }] }),
          findRecord: sinon.stub().resolves(),
        });
        router = EmberObject.create({ transitionTo: sinon.stub() });
        competenceEvaluationService.set('router', router);
        competenceEvaluationService.set('store', store);

        // when
        await competenceEvaluationService.improve({ userId, competenceId, scorecardId });
      });

      it('does not redirect to competence.resume route', async function() {
        // then
        sinon.assert.notCalled(router.transitionTo);
      });
    });

    context('when improving fails with another error', async function() {
      const error = new Error();

      beforeEach(async function() {
        // given
        competenceEvaluationService = this.owner.lookup('service:competence-evaluation');
        store = Service.create({
          queryRecord: () => reject(error),
          findRecord: sinon.stub().resolves(),
        });
        competenceEvaluationService.set('router', router);
        competenceEvaluationService.set('store', store);
      });

      it('throws error', async function() {
        // when
        try {
          await competenceEvaluationService.improve({ userId, competenceId });
        } catch (err) {
          // then
          expect(err).to.equal(err);
          return;
        }
        sinon.assert.fail('Improve Competence Evaluation should have throw an error.');
      });

      it('does not redirect to competence.resume route', async function() {
        // when
        try {
          await competenceEvaluationService.improve({ userId, competenceId });
        } catch (err) {
          // then
          sinon.assert.notCalled(router.transitionTo);
          return;
        }
        sinon.assert.fail('Improve Competence Evaluation should have throw an error.');
      });
    });

  });

});
