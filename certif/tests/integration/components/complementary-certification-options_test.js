import { render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | complementary-certification-options', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it display complementary certification options', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      habilitations: [
        { id: 0, label: 'Certif complémentaire 1', key: 'COMP_1' },
        { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2' },
      ],
    });

    const updateComplementaryCertificationStub = sinon.stub();
    this.set('updateComplementaryCertification', updateComplementaryCertificationStub);
    this.set('complementaryCertificationsHabilitations', currentAllowedCertificationCenterAccess.habilitations);

    // when
    const screen = await renderScreen(hbs`
      <ComplementaryCertificationOptions
        @updateComplementaryCertification={{this.updateComplementaryCertification}}
        @complementaryCertificationsHabilitations={{this.complementaryCertificationsHabilitations}}
      />
    `);

    // then
    assert.dom(screen.getByRole('group', { name: 'Certification complémentaire' })).exists();
    assert.dom(screen.getByRole('radio', { name: 'Certif complémentaire 1' })).exists();
    assert.dom(screen.getByRole('radio', { name: 'Certif complémentaire 2' })).exists();
  });

  module('when certification center is a complementary alone pilot', function () {
    test('it display complementary alone options', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        habilitations: [
          { id: 0, label: 'Certif complémentaire 1', key: 'COMP_1' },
          { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2' },
        ],
        isComplementaryAlonePilot: true,
      });

      const updateComplementaryCertificationStub = sinon.stub();
      this.set('updateComplementaryCertification', updateComplementaryCertificationStub);
      this.set('complementaryCertificationsHabilitations', currentAllowedCertificationCenterAccess.habilitations);
      this.set('isComplementaryAlonePilot', currentAllowedCertificationCenterAccess.isComplementaryAlonePilot);

      // when
      const screen = await renderScreen(hbs`
      <ComplementaryCertificationOptions
        @updateComplementaryCertification={{this.updateComplementaryCertification}}
        @complementaryCertificationsHabilitations={{this.complementaryCertificationsHabilitations}}
        @isComplementaryAlonePilot={{this.isComplementaryAlonePilot}}
      />
    `);

      // then
      assert.dom(screen.getByRole('group', { name: 'Quelles épreuves le candidat passera-t-il ?' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'Seulement la certification Pix+' })).exists();
      assert.dom(screen.getByRole('radio', { name: 'La certification Pix et Pix+' })).exists();
    });
  });

  module('when certification center is not a complementary alone pilot', function () {
    test('it not display complementary alone options', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        habilitations: [
          { id: 0, label: 'Certif complémentaire 1', key: 'COMP_1' },
          { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2' },
        ],
        isComplementaryAlonePilot: false,
      });

      const updateComplementaryCertificationStub = sinon.stub();
      this.set('updateComplementaryCertification', updateComplementaryCertificationStub);
      this.set('complementaryCertificationsHabilitations', currentAllowedCertificationCenterAccess.habilitations);
      this.set('isComplementaryAlonePilot', currentAllowedCertificationCenterAccess.isComplementaryAlonePilot);

      // when
      const screen = await renderScreen(hbs`
      <ComplementaryCertificationOptions
        @updateComplementaryCertification={{this.updateComplementaryCertification}}
        @complementaryCertificationsHabilitations={{this.complementaryCertificationsHabilitations}}
        @isComplementaryAlonePilot={{this.isComplementaryAlonePilot}}
      />
    `);

      // then
      assert.dom(screen.queryByRole('group', { name: 'Quelles épreuves le candidat passera-t-il ?' })).doesNotExist();
      assert.dom(screen.queryByRole('radio', { name: 'Seulement la certification Pix+' })).doesNotExist();
      assert.dom(screen.queryByRole('radio', { name: 'La certification Pix et Pix+' })).doesNotExist();
    });
  });
});
