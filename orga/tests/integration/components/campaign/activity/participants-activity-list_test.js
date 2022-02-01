import sinon from 'sinon';
import { module, test } from 'qunit';
import { render, find } from '@ember/test-helpers';
import { fillByLabel } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::ParticipantsList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participations details', async function (assert) {
    this.campaign = { idPixLabel: 'id', type: 'ASSESSMENT' };
    this.participations = [
      {
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'TO_SHARE',
        participantExternalId: 'patate',
      },
    ];
    this.onClickParticipant = sinon.stub();

    await render(hbs`<Campaign::Activity::ParticipantsList
        @campaign={{campaign}}
        @participations={{participations}}
        @onClickParticipant={{onClickParticipant}}
      />`);

    assert.contains('Joe');
    assert.contains('La frite');
    assert.contains('patate');
    assert.contains("En attente d'envoi");
  });

  module('status filter', function () {
    test('should set default', async function (assert) {
      this.campaign = { type: 'ASSESSMENT' };
      this.participations = [];
      this.selectedStatus = 'TO_SHARE';
      this.onClickParticipant = sinon.stub();

      await render(hbs`<Campaign::Activity::ParticipantsList
        @campaign={{campaign}}
        @participations={{participations}}
        @selectedStatus={{selectedStatus}}
        @onClickParticipant={{onClickParticipant}}
      />`);

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(find('[aria-label="Statut"]').selectedOptions[0].value, 'TO_SHARE');
    });

    test('should filter on participations status', async function (assert) {
      this.campaign = { type: 'ASSESSMENT' };
      this.participations = [];
      this.onClickParticipant = sinon.stub();
      this.onFilter = sinon.stub();

      await render(hbs`<Campaign::Activity::ParticipantsList
          @campaign={{campaign}}
          @participations={{participations}}
          @onClickParticipant={{onClickParticipant}}
          @onFilter={{onFilter}}
        />`);

      await fillByLabel('Statut', 'SHARED');

      assert.ok(this.onFilter.calledWith({ status: 'SHARED' }));
    });
  });
});
