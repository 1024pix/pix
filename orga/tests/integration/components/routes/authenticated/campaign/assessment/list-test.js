import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/assessment/list', function(hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  module('when a participant has shared his results', function() {
    test('it should display the participant\'s results', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });

      const participations = [
        {
          firstName: 'John',
          lastName: 'Doe',
          masteryPercentage: 80,
          isShared: true,
        },
      ];
      participations.meta = {
        rowCount: 1,
      };
      const goTo = function() {
      };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', goTo);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.notContains('En attente de participants');
      assert.contains('Doe');
      assert.contains('John');
      assert.contains('80%');
    });
  });

  module('when a participant has not shared his results yet', function() {
    test('it should display that participant\'s results are pending', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });

      const participations = [
        {
          firstName: 'John',
          lastName: 'Doe2',
          isCompleted: true,
          participantExternalId: '1234',
          isShared: false,
        },
      ];
      participations.meta = {
        rowCount: 1,
      };
      const goTo = function() {
      };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', goTo);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.contains('Doe2');
      assert.contains('John');
      assert.contains('En attente');
    });
  });

  module('when a participant has not finished the assessment', function() {
    test('it should display that participant\'s results are still ongoing', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });

      const participations = [
        {
          firstName: 'John',
          lastName: 'Doe3',
          isCompleted: false,
          participantExternalId: '12345',
          isShared: false,
        },
      ];
      participations.meta = {
        rowCount: 3,
      };
      const goTo = function() {
      };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', goTo);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.contains('Doe3');
      assert.contains('John');
      assert.contains('En cours de test');
    });
  });

  module('when the campaign asked for an external id', function() {
    test('it should display participant\'s results with external id', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        idPixLabel: 'identifiant externe',
      });

      const participations = [{ firstName: 'John', lastName: 'Doe', participantExternalId: '123' }];
      participations.meta = {
        rowCount: 1,
      };

      const goTo = function() {
      };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', goTo);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.contains('identifiant externe');
      assert.contains('123');
    });
  });

  module('when nobody started the campaign yet', function() {
    test('it should display "waiting for participants"', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });

      const participations = [];
      participations.meta = {
        rowCount: 0,
      };

      this.set('campaign', campaign);
      this.set('participations', participations);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}}/>`);

      // then
      assert.contains('En attente de participants');
    });
  });

  module('when the campaign doesn‘t have badges', function() {
    test('it should not display badge column', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });

      const participations = [{ firstName: 'John', lastName: 'Doe' }];
      participations.meta = { rowCount: 1 };

      const goTo = function() {
      };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', goTo);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.notContains('Résultats Thématiques');
    });
  });

  module('when the campaign has badges', function() {
    test('it should display badge column', async function(assert) {
      // given
      const badge = store.createRecord('badge', { id: 'b1', imageUrl: 'url-badge' });
      const targetProfile = store.createRecord('targetProfile', {
        id: 't1',
        hasBadges: true,
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
        targetProfile,
      });

      const participations = [{ firstName: 'John', lastName: 'Doe', badges: [badge] }];
      participations.meta = { rowCount: 1 };

      const goTo = function() {
      };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', goTo);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.contains('Résultats Thématiques');
      assert.dom('img[src="url-badge"]').exists();
    });
  });
});
