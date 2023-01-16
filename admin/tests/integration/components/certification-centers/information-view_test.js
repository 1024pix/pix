import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import ArrayProxy from '@ember/array/proxy';

function _createEmberDataHabilitations(store) {
  return ArrayProxy.create({
    content: [
      store.createRecord('habilitation', { id: 0, key: 'DROIT', label: 'Pix+Droit' }),
      store.createRecord('habilitation', { id: 1, key: 'CLEA', label: 'Cléa' }),
    ],
  });
}

module('Integration | Component | certification-centers/information-view', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display label and values in read mode', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const availableHabilitations = _createEmberDataHabilitations(store);
    this.availableHabilitations = availableHabilitations;

    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      dataProtectionOfficerFirstName: 'Lucky',
      dataProtectionOfficerLastName: 'Number',
      dataProtectionOfficerEmail: 'lucky@example.net',
      habilitations: [availableHabilitations.firstObject],
    });
    this.certificationCenter = certificationCenter;

    // when
    const screen = await render(
      hbs`<CertificationCenters::InformationView
  @availableHabilitations={{this.availableHabilitations}}
  @certificationCenter={{this.certificationCenter}}
/>`
    );

    // then
    assert.dom(screen.getByText('Type :')).exists();
    assert.dom(screen.getByText('Identifiant externe :')).exists();
    assert.dom(screen.getByText('Centre SCO')).exists();
    assert.dom(screen.getByText('AX129')).exists();
    assert.dom(screen.getByText('Nom du : Lucky Number')).exists();
    assert.dom(screen.getByText('Adresse e-mail du : lucky@example.net')).exists();
    assert.strictEqual(screen.getAllByTitle('Délégué à la protection des données').length, 2);
    assert.dom(screen.getByLabelText('Habilité pour Pix+Droit')).exists();
    assert.dom(screen.getByLabelText('Non-habilité pour Cléa')).exists();
  });

  test('it should show button to direct user to metabase dashboard', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });

    // when
    const screen = await render(
      hbs`<CertificationCenters::InformationView @certificationCenter={{this.certificationCenter}} />`
    );

    // then
    assert.dom(screen.getByText('Tableau de bord')).exists();
  });
});
