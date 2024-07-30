import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
} from 'pix-certif/models/certification-issue-report';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | issue-reports-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it show candidate information in title', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const report = store.createRecord('certification-report', {
      firstName: 'Lisa',
      lastName: 'Monpud',
    });
    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('reportToEdit', report);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);
    this.set('onClickIssueReport', onClickIssueReportStub);

    // when
    const { getByRole } = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @report={{this.reportToEdit}}
  @closeModal={{this.closeIssueReportsModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
/>`);

    // then
    assert.dom(getByRole('heading', { name: 'Signalement du candidat : Lisa Monpud' })).exists();
  });

  test('it should close modal onclick "Ajouter un signalement"', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const report = store.createRecord('certification-report');

    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('report', report);
    this.set('onClickIssueReport', onClickIssueReportStub);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);

    // when
    const { getByRole } = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @report={{this.report}}
  @closeModal={{this.closeIssueReportsModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
/>`);
    await click(getByRole('button', { name: 'Ajouter un signalement' }));

    // then
    assert.ok(onClickIssueReportStub.calledOnceWith(report));
  });

  test('it should show Mes signalements (2)', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const issue1 = store.createRecord('certification-issue-report', {
      category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
    });
    const issue2 = store.createRecord('certification-issue-report', {
      category: certificationIssueReportCategories.SIGNATURE_ISSUE,
    });

    const report = store.createRecord('certification-report', {
      certificationIssueReports: [issue1, issue2],
    });

    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('report', report);
    this.set('onClickIssueReport', onClickIssueReportStub);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @report={{this.report}}
  @closeModal={{this.closeIssueReportsModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
/>`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Mes signalements (2)', level: 2 })).exists();
  });

  test('it should list existing issue reports with subcategory', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const issue1 = store.createRecord('certification-issue-report', {
      category: certificationIssueReportCategories.SIGNATURE_ISSUE,
    });
    const issue2 = store.createRecord('certification-issue-report', {
      category: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
      subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
    });

    const report = store.createRecord('certification-report', {
      certificationIssueReports: [issue1, issue2],
    });

    const onClickIssueReportStub = sinon.stub();
    const closeIssueReportsModalStub = sinon.stub();
    this.set('report', report);
    this.set('onClickIssueReport', onClickIssueReportStub);
    this.set('closeIssueReportsModal', closeIssueReportsModalStub);

    // when
    const screen = await render(hbs`<IssueReportModal::IssueReportsModal
  @showModal={{true}}
  @report={{this.report}}
  @closeModal={{this.closeIssueReportsModal}}
  @onClickIssueReport={{this.onClickIssueReport}}
/>`);

    // then
    assert
      .dom(screen.getByText('C4 Était présent(e) mais a oublié de signer, ou a signé sur la mauvaise ligne'))
      .exists();
    assert.dom(screen.getByText('C1-C2 Modification infos candidat')).exists();
  });
});
