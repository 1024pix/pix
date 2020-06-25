import sinon from 'sinon';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | competence-card-default ', function() {
  setupTest();

  describe('#improveCompetenceEvaluation', function() {
    let store, userId, competenceId, router;

    beforeEach(async function() {
      // given
      competenceId = 'recCompetenceId';
      const scorecard = EmberObject.create({ competenceId });
      const component = createGlimmerComponent('component:competence-card-default', { scorecard, interactive: true });
      store = Service.create({ queryRecord: sinon.stub().resolves() });
      component.store = store;
      userId = 'userId';
      component.currentUser = EmberObject.create({ user: { id: userId } });
      router = EmberObject.create({ transitionTo: sinon.stub() });
      component.router = router;

      // when
      await component.improveCompetenceEvaluation();
    });

    it('creates a competence-evaluation for improving', async function() {
      // then
      sinon.assert.calledWith(store.queryRecord, 'competence-evaluation', {
        improve: true,
        userId,
        competenceId
      });
    });

    it('redirects to competences.resume route', async function() {
      // then
      sinon.assert.calledWith(router.transitionTo, 'competences.resume', competenceId);
    });

  });
});
