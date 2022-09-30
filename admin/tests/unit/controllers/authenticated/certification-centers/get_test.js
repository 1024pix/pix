import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | authenticated/certification-centers/get', function (hooks) {
  setupTest(hooks);

  module('#updateCertificationCenter', function () {
    test('should update certificationCenter model and show a success notification', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certification-centers/get');
      const initialCertificationCenter = {
        name: 'Certification center one',
        externalId: 'BBBBBBB',
        type: 'SCO',
        isSupervisorAccessEnabled: false,
        habilitations: ['an habilitation'],
        save: sinon.stub(),
      };
      controller.model = { certificationCenter: initialCertificationCenter };

      class NotificationsStub extends Service {
        success = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      await controller.updateCertificationCenter({
        name: 'New Ton',
        externalId: '123456ABC',
        type: 'PRO',
        isSupervisorAccessEnabled: true,
        habilitations: [],
      });

      // then
      sinon.assert.calledOnce(controller.model.certificationCenter.save);
      assert.strictEqual(controller.model.certificationCenter.name, 'New Ton');
      assert.strictEqual(controller.model.certificationCenter.externalId, '123456ABC');
      assert.strictEqual(controller.model.certificationCenter.type, 'PRO');
      assert.true(controller.model.certificationCenter.isSupervisorAccessEnabled);
      assert.deepEqual(controller.model.certificationCenter.habilitations, []);
      sinon.assert.calledWith(controller.notifications.success, 'Centre de certification mis à jour avec succès.');
    });

    test('should show an error notification if save failed', async function (assert) {
      // given
      const controller = this.owner.lookup('controller:authenticated/certification-centers/get');
      controller.model = {
        certificationCenter: {
          save: sinon.stub().rejects(),
        },
      };

      class NotificationsStub extends Service {
        error = sinon.stub();
      }
      this.owner.register('service:notifications', NotificationsStub);

      // when
      await controller.updateCertificationCenter({
        name: 'New Ton',
      });

      // then
      sinon.assert.calledWith(
        controller.notifications.error,
        "Une erreur est survenue, le centre de certification n'a pas été mis à jour."
      );
      assert.ok(true);
    });
  });
});
