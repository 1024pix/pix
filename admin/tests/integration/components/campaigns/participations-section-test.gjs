import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import ParticipationsSection from 'pix-admin/components/campaigns/participations-section';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaigns | participations-section', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    // given
    class AccessControlStub extends Service {
      hasAccessToOrganizationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
  });

  test('it should display a list of participations', async function (assert) {
    // given
    const participation1 = EmberObject.create({
      firstName: 'Jean',
      lastName: 'Claude',
    });
    const participation2 = EmberObject.create({
      firstName: 'Jean',
      lastName: 'Pierre',
    });
    const participations = [participation1, participation2];
    participations.meta = { rowCount: 2 };

    // when
    const screen = await render(<template><ParticipationsSection @participations={{participations}} /></template>);

    // then
    assert.strictEqual(screen.getAllByLabelText('participation').length, 2);
  });

  test('it should display participantExternalId column if idPixLabel is set', async function (assert) {
    // given
    const participation = EmberObject.create({
      participantExternalId: '123',
    });
    const participations = [participation];
    const idPixLabel = 'identifiant';
    participations.meta = { rowCount: 2 };

    // when
    const screen = await render(
      <template><ParticipationsSection @participations={{participations}} @idPixLabel={{idPixLabel}} /></template>,
    );

    // then
    assert.dom(screen.getByText('identifiant')).exists();
  });

  test('it should display an empty table when no participations', async function (assert) {
    // given
    const participations = [];
    participations.meta = { rowCount: 2 };

    // when
    const screen = await render(<template><ParticipationsSection @participations={{participations}} /></template>);

    // then
    assert.dom(screen.getByText('Aucune participation')).exists();
  });
});
