import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | session-list', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:sessions/session-list');
  });

  module('#openSessionDeletionConfirmModal', function () {
    test('should set shouldDisplaySessionDeletionModal to true', async function (assert) {
      // given
      const sessionId = null;
      component.shouldDisplaySessionDeletionModal = false;
      const event = {
        stopPropagation: sinon.stub(),
      };

      // when
      await component.openSessionDeletionConfirmModal(sessionId, 1, event);

      // then
      assert.true(component.shouldDisplaySessionDeletionModal);
    });

    test('should call stopPropagation method', async function (assert) {
      // given
      const sessionId = null;
      component.shouldDisplaySessionDeletionModal = false;
      const event = {
        stopPropagation: sinon.stub(),
      };

      // when
      await component.openSessionDeletionConfirmModal(sessionId, 1, event);

      // then
      sinon.assert.calledOnce(event.stopPropagation);
      assert.ok(true);
    });

    test('should set the currentEnrolledCandidatesCount value', async function (assert) {
      // given
      const sessionId = null;
      component.shouldDisplaySessionDeletionModal = false;
      const event = {
        stopPropagation: sinon.stub(),
      };

      // when
      await component.openSessionDeletionConfirmModal(sessionId, 99, event);

      // then
      assert.strictEqual(component.currentEnrolledCandidatesCount, 99);
    });
  });

  module('#closeSessionDeletionConfirmModal', function () {
    test('should set shouldDisplaySessionDeletionModal to false', async function (assert) {
      // given
      component.shouldDisplaySessionDeletionModal = true;

      // when
      await component.closeSessionDeletionConfirmModal();

      // then
      assert.false(component.shouldDisplaySessionDeletionModal);
    });
  });

  module('#currentLocale', function () {
    test('should set currentLocale to primaryLocale', async function (assert) {
      // given
      class IntlStub extends Service {
        primaryLocale = 'fr';
      }
      this.owner.register('service:intl', IntlStub);

      // when
      const locale = await component.currentLocale;

      // then
      assert.strictEqual(locale, 'fr');
    });
  });
});
