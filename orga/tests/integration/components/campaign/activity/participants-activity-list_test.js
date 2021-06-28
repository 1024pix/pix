import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::ParticipantsList', function(hooks) {
  setupIntlRenderingTest(hooks);

  module('when there are no participations', function() {

    test('it should display empty message', async function(assert) {

      this.campaign = { idPixLabel: null, type: 'ASSESSMENT' };
      this.participations = [];

      await render(hbs`<Campaign::Activity::ParticipantsList
        @campaign={{campaign}}
        @participations={{participations}}
      />`);

      assert.contains('Aucun participant');
    });
  });

  module('when there are participations', function() {

    test('it should display participations details', async function(assert) {

      this.campaign = { idPixLabel: 'id', type: 'ASSESSMENT' };
      this.participations = [{
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'completed',
        participantExternalId: 'patate',
      }];

      await render(hbs`<Campaign::Activity::ParticipantsList
        @campaign={{campaign}}
        @participations={{participations}}
      />`);

      assert.contains('Joe');
      assert.contains('La frite');
      assert.contains('patate');
      assert.contains('En attente d\'envoi');
    });
  });
});
