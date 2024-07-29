import { clickByName, fillByLabel, render as renderScreen } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | certifications/issue-reports/resolve-issue-report-modal', function (hooks) {
  setupRenderingTest(hooks);

  module('when the issue is not resolved', function () {
    test('it should display a report resolution title', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
      this.set('issueReport', issueReport);

      this.toggleResolveModal = sinon.stub().returns();
      this.resolveIssueReport = sinon.stub().resolves();
      this.closeResolveModal = sinon.stub().returns();

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

      // Then
      assert.dom(screen.getByRole('dialog', { name: 'Résoudre ce signalement' })).exists();
    });

    test('it should display resolve button', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
      this.set('issueReport', issueReport);

      this.toggleResolveModal = sinon.stub().returns();
      this.resolveIssueReport = sinon.stub().resolves();
      this.closeResolveModal = sinon.stub().returns();

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

      // Then
      assert.dom(screen.getByRole('button', { name: 'Résoudre ce signalement' })).exists();
    });
  });

  module('when clicking on Cancel button', function () {
    test('it should close the modal', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
      this.set('issueReport', issueReport);
      this.toggleResolveModal = sinon.stub().returns();
      this.resolveIssueReport = sinon.stub().resolves();
      this.closeResolveModal = sinon.stub().returns();

      await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

      // When
      await clickByName('Annuler');

      // Then
      sinon.assert.calledOnce(this.toggleResolveModal);
      assert.ok(true);
    });
  });
  module('when clicking on "Résoudre ce signalement" button', function () {
    test('it should close the modal', async function (assert) {
      // Given
      const store = this.owner.lookup('service:store');
      const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
      this.set('issueReport', issueReport);
      this.toggleResolveModal = sinon.stub().returns();
      this.resolveIssueReport = sinon.stub().resolves();
      this.closeResolveModal = sinon.stub().returns();

      await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

      // When
      await clickByName('Résoudre ce signalement');

      // Then
      sinon.assert.calledOnce(this.closeResolveModal);
      assert.ok(true);
    });

    module('when no label has been keyed', function () {
      test('it should call resolveIssueReport with issue-report and no label', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
        this.set('issueReport', issueReport);
        this.toggleResolveModal = sinon.stub().returns();
        this.resolveIssueReport = sinon.stub().resolves();
        this.closeResolveModal = sinon.stub().returns();

        await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

        // When
        await clickByName('Résoudre ce signalement');

        // Then
        sinon.assert.calledWith(this.resolveIssueReport, this.issueReport);
        assert.ok(true);
      });
    });
    module('when a label has been keyed', function () {
      test('it should call resolveIssueReport with issue-report and keyed label', async function (assert) {
        // Given
        const store = this.owner.lookup('service:store');
        const issueReport = store.createRecord('certification-issue-report', { isImpactful: true, resolvedAt: null });
        this.set('issueReport', issueReport);
        this.toggleResolveModal = sinon.stub().returns();
        this.resolveIssueReport = sinon.stub().resolves();
        this.closeResolveModal = sinon.stub().returns();

        await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

        // When
        await fillByLabel('Résolution', 'This is a fraud, its certification has been revoked');
        await clickByName('Résoudre ce signalement');

        // Then
        sinon.assert.calledWith(
          this.resolveIssueReport,
          this.issueReport,
          'This is a fraud, its certification has been revoked',
        );
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
      this.set('issueReport', issueReport);

      this.toggleResolveModal = sinon.stub().returns();
      this.resolveIssueReport = sinon.stub().resolves();
      this.closeResolveModal = sinon.stub().returns();

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

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
        this.set('issueReport', issueReport);

        this.toggleResolveModal = sinon.stub().returns();
        this.resolveIssueReport = sinon.stub().resolves();
        this.closeResolveModal = sinon.stub().returns();

        const screen = await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolvecandidateIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

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
      this.set('issueReport', issueReport);

      this.toggleResolveModal = sinon.stub().returns();
      this.resolveIssueReport = sinon.stub().resolves();
      this.closeResolveModal = sinon.stub().returns();

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

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
      this.set('issueReport', issueReport);

      this.toggleResolveModal = sinon.stub().returns();
      this.resolveIssueReport = sinon.stub().resolves();
      this.closeResolveModal = sinon.stub().returns();

      // When
      const screen = await renderScreen(hbs`<Certifications::IssueReports::ResolveIssueReportModal
  @toggleResolveModal={{this.toggleResolveModal}}
  @issueReport={{this.issueReport}}
  @resolveIssueReport={{this.resolveIssueReport}}
  @closeResolveModal={{this.closeResolveModal}}
  @displayModal={{true}}
/>`);

      // Then
      assert.dom(screen.getByRole('textbox', { name: 'Résolution' })).hasValue('resolved by John Doe');
    });
  });
});
