import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../helpers/create-glimmer-component';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Component | enrolled-candidates', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:enrolled-candidates');
  });

  module('#deleteCertificationCandidate', function () {
    test('should delete the candidate action with appropriate adapter options', async function (assert) {
      // given
      const sessionId = 'sessionId';
      const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.deleteCertificationCandidate(candidate);

      // then
      sinon.assert.calledWithExactly(candidate.destroyRecord, {
        adapterOptions: {
          sessionId,
        },
      });
      assert.ok(true);
    });
  });

  module('#updateCandidate', function () {
    module('when update succeeds', function () {
      test('should update the candidate with appropriate edited parameters', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('certification-candidate');
        adapter.updateRecord = sinon.stub();
        adapter.updateRecord.resolves();

        const notifications = this.owner.lookup('service:notifications');
        notifications.success = sinon.stub();

        const sessionId = 'sessionId';
        const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
        component.args = {
          sessionId,
          reloadCertificationCandidate: sinon.stub(),
        };
        component.certificationCandidateInEditModal = candidate;

        const event = {
          preventDefault: sinon.stub(),
        };

        // when
        await component.updateCandidate(event);

        // then
        sinon.assert.calledOnce(notifications.success);
        sinon.assert.calledWithExactly(adapter.updateRecord, {
          candidate: component.certificationCandidateInEditModal,
          sessionId,
        });
        assert.ok(true);
      });
    });

    module('when update fails', function () {
      test('should display an error message', async function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const adapter = store.adapterFor('certification-candidate');
        adapter.updateRecord = sinon.stub();
        adapter.updateRecord.throws();

        const notifications = this.owner.lookup('service:notifications');
        notifications.error = sinon.stub();

        const sessionId = 'sessionId';
        const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
        component.args = {
          sessionId,
          reloadCertificationCandidate: sinon.stub(),
        };
        component.certificationCandidateInEditModal = candidate;

        const event = {
          preventDefault: sinon.stub(),
        };

        // when
        await component.updateCandidate(event);

        // then
        sinon.assert.calledOnce(notifications.error);
        assert.ok(true);
      });
    });
  });

  module('#openCertificationCandidateDetailsModal', function () {
    test('should open the candidate details modal', async function (assert) {
      // given
      const sessionId = 'sessionId';
      const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.openCertificationCandidateDetailsModal(candidate);

      // then
      assert.true(component.shouldDisplayCertificationCandidateModal);
      assert.strictEqual(component.certificationCandidateInDetailsModal, candidate);
    });
  });

  module('#closeCertificationCandidateDetailsModal', function () {
    test('should close the candidate details modal', async function (assert) {
      // given
      const sessionId = 'sessionId';
      const candidate = _buildCandidate({}, { destroyRecord: sinon.stub() });
      component.shouldDisplayCertificationCandidateModal = true;
      component.certificationCandidateInDetailsModal = candidate;
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.closeCertificationCandidateDetailsModal();

      // then
      assert.false(component.shouldDisplayCertificationCandidateModal);
      assert.strictEqual(component.certificationCandidateInDetailsModal, null);
    });
  });

  module('#openNewCandidateModal', function () {
    test('should open the new certification candidate modal', async function (assert) {
      // given
      const sessionId = 'sessionId';
      component.showNewCandidateModal = false;
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.openNewCandidateModal();

      // then
      assert.true(component.showNewCandidateModal);
    });
  });

  module('#closeNewCandidateModal', function () {
    test('should close the new certification candidate modal', async function (assert) {
      // given
      const sessionId = 'sessionId';
      component.showNewCandidateModal = true;
      component.args = {
        certificationCandidates: [],
        sessionId,
      };

      // when
      await component.closeNewCandidateModal();

      // then
      assert.false(component.showNewCandidateModal);
    });
  });

  function _buildCandidate({ firstName = 'Georges', lastName = 'Brassens', birthdate = '2010-04-04' }, otherProps) {
    return {
      firstName,
      lastName,
      birthdate,
      birthCity: 'Ici',
      birthProvinceCode: 'Code',
      birthCountry: 'Country',
      externalId: 'Abcde',
      email: 'a@a.com',
      resultRecipientEmail: 'destinataire@result.com',
      extraTimePercentage: 'Extra',
      ...otherProps,
    };
  }
});