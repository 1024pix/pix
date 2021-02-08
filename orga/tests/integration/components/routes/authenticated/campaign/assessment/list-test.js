import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import sinon from 'sinon';
import Service from '@ember/service';
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

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.notContains('Aucun participant');
      assert.contains('Doe');
      assert.contains('John');
      assert.contains('80%');
    });

    test('it should display badge and tooltip', async function(assert) {
      // given
      const badge = store.createRecord('badge', { imageUrl: 'url-badge' });
      const campaign = store.createRecord('campaign', {
        badges: [badge],
      });

      const participations = [{ badges: [badge], isShared: true }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.dom('.pix-tooltip__content').exists();
      assert.dom('img[src="url-badge"]').exists();
    });
  });

  module('when a participant has not shared his results yet', function() {
    test('it should display that participant\'s results are pending', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
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

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.contains('Doe2');
      assert.contains('John');
      assert.contains('En attente');
    });

    test('it should not display badge neither tooltip', async function(assert) {
      // given
      const badge = store.createRecord('badge', { imageUrl: 'url-badge' });
      const campaign = store.createRecord('campaign', {
        badges: [badge],
      });

      const participations = [{ badges: [badge], isShared: false }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.dom('.pix-tooltip__content').doesNotExist();
      assert.dom('img[src="url-badge"]').doesNotExist();
    });
  });

  module('when a participant has not finished the assessment', function() {
    test('it should display that participant\'s results are still ongoing', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
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

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

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
        idPixLabel: 'identifiant externe',
      });

      const participations = [{ participantExternalId: '123' }];
      participations.meta = {
        rowCount: 1,
      };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

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
      assert.contains('Aucun participant');
    });
  });

  module('when the campaign doesn‘t have badges', function() {
    test('it should not display badge column', async function(assert) {
      // given
      const campaign = store.createRecord('campaign', {
        badges: [],
      });

      const participations = [{}];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.notContains('Résultats Thématiques');
    });
  });

  module('when the campaign has badges', function() {
    test('it should display badge column', async function(assert) {
      // given
      const badge = store.createRecord('badge');
      const campaign = store.createRecord('campaign', {
        badges: [badge],
      });

      const participations = [{ }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.contains('Résultats Thématiques');
    });

    test('it filters the participations when a badge is selected', async function(assert) {
      // given
      const badge = store.createRecord('badge', { id: 'badge1', title: 'Les bases' });
      const campaign = store.createRecord('campaign', {
        type: 'ASSESSMENT',
        badges: [badge],
      });

      const participations = [{ firstName: 'John', lastName: 'Doe', masteryPercentage: 60, isShared: true }];
      participations.meta = { rowCount: 1 };
      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});
      this.set('triggerFiltering', triggerFiltering);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}} @triggerFiltering={{triggerFiltering}}/>`);
      await click('[for="badge-badge1"]');

      // then
      assert.ok(triggerFiltering.calledWith({ badges: ['badge1'] }));
    });
  });

  module('when the campaign has stages', function() {
    test('it should display stars instead of mastery percentage in result column', async function(assert) {
      // given
      const stage = store.createRecord('stage', { threshold: 50 });
      const campaign = store.createRecord('campaign', {
        stages: [stage],
      });

      const participations = [{ masteryPercentage: 60, isShared: true }];
      participations.meta = { rowCount: 1 };

      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}}/>`);

      // then
      assert.notContains('60%');
      assert.dom('.pix-stars').exists();
    });
  });

  module('when user works for a SCO organization which manages students', function() {
    class CurrentUserStub extends Service {
      prescriber = { areNewYearSchoolingRegistrationsImported: false }
      isSCOManagingStudents = true;
    }

    test('it filter the participations when a division is selected', async function(assert) {
      this.owner.register('service:current-user', CurrentUserStub);

      // given
      const division = store.createRecord('division', {
        id: 'd1',
        name: 'd1',
      });
      const campaign = store.createRecord('campaign', {
        id: 1,
        name: 'campagne 1',
      });
      campaign.set('divisions', [division]);

      const participations = [{ firstName: 'John', lastName: 'Doe', masteryPercentage: 60, isShared: true }];
      participations.meta = { rowCount: 1 };
      const triggerFiltering = sinon.stub();
      this.set('campaign', campaign);
      this.set('participations', participations);
      this.set('goToAssessmentPage', () => {});
      this.set('triggerFiltering', triggerFiltering);

      // when
      await render(hbs`<Routes::Authenticated::Campaign::Assessment::List @campaign={{campaign}} @participations={{participations}} @goToAssessmentPage={{goToAssessmentPage}} @triggerFiltering={{triggerFiltering}}/>`);
      await click('[for="division-d1"]');

      // then
      assert.ok(triggerFiltering.calledWith({ divisions: ['d1'] }));
    });

  });
});
