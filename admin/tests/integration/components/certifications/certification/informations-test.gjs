import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import CertificationInformations from 'pix-admin/components/certifications/certification/informations';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Certification | Informations', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    sinon.stub(store, 'findAll').withArgs('country').resolves([]);

    class AccessControlStub extends Service {
      hasAccessToCertificationActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
  });

  test('should display the global actions block', async function (assert) {
    // given
    const certification = store.createRecord('certification', { userId: 1, competencesWithMark: [] });
    const session = store.createRecord('session', { id: '7404' });

    // when
    const screen = await render(
      <template><CertificationInformations @certification={{certification}} @session={{session}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('link', { name: "Voir les détails de l'utilisateur" })).exists();
  });

  test('should display certification state card', async function (assert) {
    // given
    const certification = store.createRecord('certification', { competencesWithMark: [] });
    const session = store.createRecord('session', { id: '7404' });

    // when
    const screen = await render(
      <template><CertificationInformations @certification={{certification}} @session={{session}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'État Non publiée' })).exists();
  });

  test('should display the certification candidate card', async function (assert) {
    // given
    const certification = store.createRecord('certification', { competencesWithMark: [] });
    const session = store.createRecord('session', { id: '7404' });

    // when
    const screen = await render(
      <template><CertificationInformations @certification={{certification}} @session={{session}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'Candidat' })).exists();
  });

  module('Pix+ Edu V3 results', function () {
    test('should display Pix+ Edu V3 results when certification is Pix+ Edu, V3 and validated', async function (assert) {
      // given
      const certification = store.createRecord('certification', {
        competencesWithMark: [],
        certificationFramework: 'EDU_1ER_DEGRE',
        version: 3,
        status: 'validated',
        reachedResultKey: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE.ADVANCED',
      });
      const session = store.createRecord('session', { id: '7404' });

      // when
      const screen = await render(
        <template><CertificationInformations @certification={{certification}} @session={{session}} /></template>,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: t('components.certifications.edu-results.v3.title') })).exists();
    });

    test('should not display Pix+ Edu V3 results when certification is cancelled', async function (assert) {
      // given
      const certification = store.createRecord('certification', {
        competencesWithMark: [],
        certificationFramework: 'EDU_1ER_DEGRE',
        version: 3,
        status: 'cancelled',
        reachedResultKey: 'PIX_EDU_FORMATION_INITIALE_1ER_DEGRE.ADVANCED',
      });
      const session = store.createRecord('session', { id: '7404' });

      // when
      const screen = await render(
        <template><CertificationInformations @certification={{certification}} @session={{session}} /></template>,
      );

      // then
      assert
        .dom(screen.queryByRole('heading', { name: t('components.certifications.edu-results.v3.title') }))
        .doesNotExist();
    });

    test('should not display Pix+ Edu V3 results when certification is rejected', async function (assert) {
      // given
      const certification = store.createRecord('certification', {
        competencesWithMark: [],
        certificationFramework: 'EDU_1ER_DEGRE',
        version: 3,
        status: 'rejected',
        reachedResultKey: 'BELOW_MINIMUM',
      });
      const session = store.createRecord('session', { id: '7404' });

      // when
      const screen = await render(
        <template><CertificationInformations @certification={{certification}} @session={{session}} /></template>,
      );

      // then
      assert
        .dom(screen.queryByRole('heading', { name: t('components.certifications.edu-results.v3.title') }))
        .doesNotExist();
    });
  });

  module('issue reports', function () {
    module('when there is no issue report', function () {
      test('should not display issue reports card', async function (assert) {
        // given
        const certification = store.createRecord('certification', { competencesWithMark: [] });
        const session = store.createRecord('session', { id: '7404' });
        const issueReports = [];

        // when
        const screen = await render(
          <template>
            <CertificationInformations
              @certification={{certification}}
              @session={{session}}
              @certificationIssueReports={{issueReports}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByRole('heading', { name: 'Signalements' })).doesNotExist();
      });
    });

    module('when there is at least one issue report', function () {
      test('should display issue reports card', async function (assert) {
        // given
        const certification = store.createRecord('certification', { competencesWithMark: [] });
        const session = store.createRecord('session', { id: '7404' });
        const issueReports = [store.createRecord('certification-issue-report')];

        // when
        const screen = await render(
          <template>
            <CertificationInformations
              @certification={{certification}}
              @session={{session}}
              @certificationIssueReports={{issueReports}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByRole('heading', { name: 'Signalements' })).exists();
      });
    });
  });
});
