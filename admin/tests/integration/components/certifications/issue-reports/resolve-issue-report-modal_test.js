import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { clickByName, fillByLabel, render as renderScreen } from '@1024pix/ember-testing-library';
import sinon from 'sinon';

module('Integration | Component | certifications/issue-reports/resolve-issue-report-modal', function (hooks) {
  setupRenderingTest(hooks);

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
                  />`);

    // Then
    assert.dom(screen.getByRole('button', { name: 'Ok' })).exists();
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
                  />`);

      // When
      await clickByName('Annuler');

      // Then
      sinon.assert.calledOnce(this.toggleResolveModal);
      assert.ok(true);
    });
  });
  module('when clicking on OK button', function () {
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
                  />`);

      // When
      await clickByName('Ok');

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
                  />`);

        // When
        await clickByName('Ok');

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
                  />`);

        // When
        await fillByLabel('Motif', 'This is a fraud, its certification has been revoked');
        await clickByName('Ok');

        // Then
        sinon.assert.calledWith(
          this.resolveIssueReport,
          this.issueReport,
          'This is a fraud, its certification has been revoked'
        );
        assert.ok(true);
      });
    });
  });
});
