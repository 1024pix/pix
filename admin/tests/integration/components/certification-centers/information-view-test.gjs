import { render } from '@1024pix/ember-testing-library';
import ArrayProxy from '@ember/array/proxy';
import { t } from 'ember-intl/test-support';
import InformationView from 'pix-admin/components/certification-centers/information-view';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
function _createEmberDataHabilitations(store) {
  return ArrayProxy.create({
    content: [
      store.createRecord('complementary-certification', { id: 0, key: 'DROIT', label: 'Pix+Droit' }),
      store.createRecord('complementary-certification', { id: 1, key: 'CLEA', label: 'Cléa' }),
    ],
  });
}

module('Integration | Component | certification-centers/information-view', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display label and values in read mode', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const availableHabilitations = _createEmberDataHabilitations(store);

    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      dataProtectionOfficerFirstName: 'Lucky',
      dataProtectionOfficerLastName: 'Number',
      dataProtectionOfficerEmail: 'lucky@example.net',
      habilitations: [availableHabilitations.firstObject],
    });

    // when
    const screen = await render(
      <template>
        <InformationView
          @availableHabilitations={{availableHabilitations}}
          @certificationCenter={{certificationCenter}}
        />
      </template>,
    );

    // then
    assert.dom(screen.getByText('Type :')).exists();
    assert.dom(screen.getByText('Identifiant externe :')).exists();
    assert.dom(screen.getByText('Centre SCO')).exists();
    assert.dom(screen.getByText('AX129')).exists();
    assert.dom(screen.getByText('Lucky Number')).exists();
    assert.dom(screen.getByText('lucky@example.net')).exists();
    assert.strictEqual(screen.getAllByTitle('Délégué à la protection des données').length, 2);
    assert.dom(screen.getByLabelText('Habilité pour Pix+Droit')).exists();
    assert.dom(screen.getByLabelText('Non habilité pour Cléa')).exists();
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
    const screen = await render(<template><InformationView @certificationCenter={{certificationCenter}} /></template>);

    // then
    assert.dom(screen.getByText('Tableau de bord')).exists();
  });

  module('certification center is complementary alone pilot', function () {
    test('it should display that the certification center is complementary alone pilot', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const certificationCenter = store.createRecord('certification-center', {
        type: 'SCO',
        isComplementaryAlonePilot: true,
      });

      // when
      const screen = await render(
        <template><InformationView @certificationCenter={{certificationCenter}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByLabelText(
            t(
              'pages.certification-centers.information-view.pilot-features.is-complementary-alone-pilot.aria-label.active',
            ),
          ),
        )
        .exists();
    });
  });

  module('certification center is NOT complementary alone pilot', function () {
    test('it should display that the certification center is NOT complementary alone pilot', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      const certificationCenter = store.createRecord('certification-center', {
        type: 'SCO',
        isComplementaryAlonePilot: false,
      });

      // when
      const screen = await render(
        <template><InformationView @certificationCenter={{certificationCenter}} /></template>,
      );

      // then
      assert
        .dom(
          screen.getByLabelText(
            t(
              'pages.certification-centers.information-view.pilot-features.is-complementary-alone-pilot.aria-label.inactive',
            ),
          ),
        )
        .exists();
    });
  });
});
