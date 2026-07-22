import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import InformationView from 'pix-admin/components/certification-centers/information-view';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | certification-centers/information-view', function (hooks) {
  setupIntlRenderingTest(hooks);

  const toggleEditMode = sinon.stub();
  const toggleShowArchiveModal = sinon.stub();

  test('it should display label and values in read mode', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const pixDroitHabilitation = store.createRecord('complementary-certification', {
      id: '0',
      key: 'DROIT',
      label: 'Pix+Droit',
    });
    const cleaHabilitation = store.createRecord('complementary-certification', { id: '1', key: 'CLEA', label: 'Cléa' });
    const availableHabilitations = [pixDroitHabilitation, cleaHabilitation];

    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      dataProtectionOfficerFirstName: 'Lucky',
      dataProtectionOfficerLastName: 'Number',
      dataProtectionOfficerEmail: 'lucky@example.net',
      habilitations: [pixDroitHabilitation],
      createdAt: new Date('2023-07-27'),
    });

    // when
    const screen = await render(
      <template>
        <InformationView
          @availableHabilitations={{availableHabilitations}}
          @certificationCenter={{certificationCenter}}
          @toggleEditMode={{toggleEditMode}}
          @toggleShowArchiveModal={{toggleShowArchiveModal}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText(t('pages.certification-centers.information-view.list.type'))).exists();
    assert.dom(screen.getByText(t('pages.certification-centers.information-view.list.external-id'))).exists();
    assert.dom(screen.getByText('Centre SCO')).exists();
    assert.dom(screen.getByText('AX129')).exists();
    assert.dom(screen.getByText('Lucky Number')).exists();
    assert.dom(screen.getByText('lucky@example.net')).exists();
    assert.strictEqual(screen.getAllByTitle('Délégué à la protection des données').length, 2);
    assert.dom(screen.getByLabelText('Habilité pour Pix+Droit')).exists();
    assert.dom(screen.getByLabelText('Non habilité pour Cléa')).exists();
    assert.dom(screen.getByText('27/07/2023')).exists();
  });

  test('it should show button to direct user to metabase dashboard', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });

    // when
    const screen = await render(
      <template>
        <InformationView
          @certificationCenter={{certificationCenter}}
          @toggleEditMode={{toggleEditMode}}
          @toggleShowArchiveModal={{toggleShowArchiveModal}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Tableau de bord')).exists();
  });
});
