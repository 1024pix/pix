import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import ResolveIssueReportModal from 'pix-admin/components/certifications/issue-reports/resolve-issue-report-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | certifications/issue-reports/resolve-issue-report-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when the issue is not resolved', function () {
    test('it should display a report resolution title', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });

      const toggleResolveModal = sinon.stub().returns();
      const resolveIssueReport = sinon.stub().resolves();
      const closeResolveModal = sinon.stub().returns();

      // When
      const screen = await render(
        <template>
          <ResolveIssueReportModal
            @toggleResolveModal={{toggleResolveModal}}
            @issueReport={{issueReport}}
            @resolveIssueReport={{resolveIssueReport}}
            @closeResolveModal={{closeResolveModal}}
            @displayModal={{true}}
          />
        </template>,
      );

      // Then
      assert.dom(screen.getByRole('dialog', { name: 'Résoudre ce signalement' })).exists();
    });

    test('it should display resolve button', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });

      const toggleResolveModal = sinon.stub().returns();
      const resolveIssueReport = sinon.stub().resolves();
      const closeResolveModal = sinon.stub().returns();

      // When
      const screen = await render(
        <template>
          <ResolveIssueReportModal
            @toggleResolveModal={{toggleResolveModal}}
            @issueReport={{issueReport}}
            @resolveIssueReport={{resolveIssueReport}}
            @closeResolveModal={{closeResolveModal}}
            @displayModal={{true}}
          />
        </template>,
      );

      // Then
      assert.dom(screen.getByRole('button', { name: 'Résoudre ce signalement' })).exists();
    });
  });

  module('when clicking on Cancel button', function () {
    test('it should close the modal', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });

      const toggleResolveModal = sinon.stub().returns();
      const resolveIssueReport = sinon.stub().resolves();
      const closeResolveModal = sinon.stub().returns();

      await render(
        <template>
          <ResolveIssueReportModal
            @toggleResolveModal={{toggleResolveModal}}
            @issueReport={{issueReport}}
            @resolveIssueReport={{resolveIssueReport}}
            @closeResolveModal={{closeResolveModal}}
            @displayModal={{true}}
          />
        </template>,
      );

      // When
      await clickByName('Annuler');

      // Then
      sinon.assert.calledOnce(toggleResolveModal);
      assert.ok(true);
    });
  });
  module('when clicking on "Résoudre ce signalement" button', function () {
    test('it should close the modal', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });

      const toggleResolveModal = sinon.stub().returns();
      const resolveIssueReport = sinon.stub().resolves();
      const closeResolveModal = sinon.stub().returns();

      await render(
        <template>
          <ResolveIssueReportModal
            @toggleResolveModal={{toggleResolveModal}}
            @issueReport={{issueReport}}
            @resolveIssueReport={{resolveIssueReport}}
            @closeResolveModal={{closeResolveModal}}
            @displayModal={{true}}
          />
        </template>,
      );

      // When
      await clickByName('Résoudre ce signalement');

      // Then
      sinon.assert.calledOnce(closeResolveModal);
      assert.ok(true);
    });

    module('when no label has been keyed', function () {
      test('it should call resolveIssueReport with issue-report and no label', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });

        const toggleResolveModal = sinon.stub().returns();
        const resolveIssueReport = sinon.stub().resolves();
        const closeResolveModal = sinon.stub().returns();

        await render(
          <template>
            <ResolveIssueReportModal
              @toggleResolveModal={{toggleResolveModal}}
              @issueReport={{issueReport}}
              @resolveIssueReport={{resolveIssueReport}}
              @closeResolveModal={{closeResolveModal}}
              @displayModal={{true}}
            />
          </template>,
        );

        // When
        await clickByName('Résoudre ce signalement');

        // Then
        sinon.assert.calledWith(resolveIssueReport, issueReport);
        assert.ok(true);
      });
    });
    module('when a label has been keyed', function () {
      test('it should call resolveIssueReport with issue-report and keyed label', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });

        const toggleResolveModal = sinon.stub().returns();
        const resolveIssueReport = sinon.stub().resolves();
        const closeResolveModal = sinon.stub().returns();

        await render(
          <template>
            <ResolveIssueReportModal
              @toggleResolveModal={{toggleResolveModal}}
              @issueReport={{issueReport}}
              @resolveIssueReport={{resolveIssueReport}}
              @closeResolveModal={{closeResolveModal}}
              @displayModal={{true}}
            />
          </template>,
        );

        // When
        await fillByLabel('Résolution', 'This is a fraud, its certification has been revoked');
        await clickByName('Résoudre ce signalement');

        // Then
        sinon.assert.calledWith(resolveIssueReport, issueReport, 'This is a fraud, its certification has been revoked');
        assert.ok(true);
      });
    });
  });

  module('when the issue report is already resolved', function () {
    test('it should display a report resolution title', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', {
        isImpactful: true,
        resolvedAt: new Date(),
        resolution: 'resolved',
      });

      const toggleResolveModal = sinon.stub().returns();
      const resolveIssueReport = sinon.stub().resolves();
      const closeResolveModal = sinon.stub().returns();

      // When
      const screen = await render(
        <template>
          <ResolveIssueReportModal
            @toggleResolveModal={{toggleResolveModal}}
            @issueReport={{issueReport}}
            @resolveIssueReport={{resolveIssueReport}}
            @closeResolveModal={{closeResolveModal}}
            @displayModal={{true}}
          />
        </template>,
      );

      // Then
      assert.dom(screen.getByRole('dialog', { name: 'Modifier la résolution' })).exists();
    });
    module('when updating the resolution with an empty text', function () {
      test('it should display an error message', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', {
          isImpactful: true,
          resolvedAt: new Date(),
          resolution: 'resolved',
        });

        const toggleResolveModal = sinon.stub().returns();
        const resolveIssueReport = sinon.stub().resolves();
        const closeResolveModal = sinon.stub().returns();

        const screen = await render(
          <template>
            <ResolveIssueReportModal
              @toggleResolveModal={{toggleResolveModal}}
              @issueReport={{issueReport}}
              @resolvecandidateIssueReport={{resolveIssueReport}}
              @closeResolveModal={{closeResolveModal}}
              @displayModal={{true}}
            />
          </template>,
        );

        // when
        await clickByName('Modifier la résolution');

        // Then
        assert.dom(screen.getByText('Le motif de résolution doit être renseigné.')).exists();
      });
    });
    test('it should display modification button', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', {
        isImpactful: true,
        resolvedAt: new Date(),
        resolution: '',
      });

      const toggleResolveModal = sinon.stub().returns();
      const resolveIssueReport = sinon.stub().resolves();
      const closeResolveModal = sinon.stub().returns();

      // When
      const screen = await render(
        <template>
          <ResolveIssueReportModal
            @toggleResolveModal={{toggleResolveModal}}
            @issueReport={{issueReport}}
            @resolveIssueReport={{resolveIssueReport}}
            @closeResolveModal={{closeResolveModal}}
            @displayModal={{true}}
          />
        </template>,
      );

      // Then
      assert.dom(screen.getByRole('button', { name: 'Modifier la résolution' })).exists();
    });
    test('it should display actual resolution text', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', {
        isImpactful: true,
        resolvedAt: new Date(),
        resolution: 'resolved by John Doe',
      });

      const toggleResolveModal = sinon.stub().returns();
      const resolveIssueReport = sinon.stub().resolves();
      const closeResolveModal = sinon.stub().returns();

      // When
      const screen = await render(
        <template>
          <ResolveIssueReportModal
            @toggleResolveModal={{toggleResolveModal}}
            @issueReport={{issueReport}}
            @resolveIssueReport={{resolveIssueReport}}
            @closeResolveModal={{closeResolveModal}}
            @displayModal={{true}}
          />
        </template>,
      );

      // Then
      assert.dom(screen.getByRole('textbox', { name: 'Résolution' })).hasValue('resolved by John Doe');
    });
  });
});
