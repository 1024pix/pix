import sinon from 'sinon';
import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::ParticipantsList', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participations details', async function(assert) {

    this.campaign = { idPixLabel: 'id', type: 'ASSESSMENT' };
    this.participations = [{
      firstName: 'Joe',
      lastName: 'La frite',
      status: 'completed',
      participantExternalId: 'patate',
    }];
    this.onClickParticipant = sinon.stub();

    await render(hbs`<Campaign::Activity::ParticipantsList
        @campaign={{campaign}}
        @participations={{participations}}
        @onClickParticipant={{onClickParticipant}}
      />`);

    assert.contains('Joe');
    assert.contains('La frite');
    assert.contains('patate');
    assert.contains('En attente d\'envoi');
  });
});
