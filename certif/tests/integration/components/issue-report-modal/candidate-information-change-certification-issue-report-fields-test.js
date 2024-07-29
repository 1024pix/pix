import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { certificationIssueReportSubcategories } from 'pix-certif/models/certification-issue-report';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | candidate-information-change-certification-issue-report-fields', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should call toggle function on click radio button', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const candidateInformationChangeCategory = { isChecked: false };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);

    // when
    const screen = await render(hbs`<IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
  @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
/>`);

    await click(screen.getByRole('radio'));

    // then
    assert.ok(toggleOnCategory.calledOnceWith(candidateInformationChangeCategory));
  });

  test('it should show dropdown menu with subcategories when category is checked', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const updateCandidateInformationChangeCategory = sinon.stub();
    const candidateInformationChangeCategory = {
      isChecked: true,
      subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
    };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);
    this.set('updateCandidateInformationChangeCategory', updateCandidateInformationChangeCategory);

    // when
    const screen = await render(hbs`<IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
  @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
  @updateCandidateInformationChangeCategoryDescription={{this.updateCandidateInformationChangeCategory}}
/>`);
    await click(screen.getByRole('radio'));

    // then
    assert.dom(screen.getByRole('button', { name: 'Sélectionnez une sous-catégorie :' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Renseignez les informations correctes' })).exists();
  });

  test('it should show "Renseignez les informations correctes" if subcategory NAME_OR_BIRTHDATE is selected', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const updateCandidateInformationChangeCategory = sinon.stub();
    const candidateInformationChangeCategory = {
      isChecked: true,
      subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
    };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);
    this.set('updateCandidateInformationChangeCategory', updateCandidateInformationChangeCategory);

    // when
    const screen = await render(hbs`<IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
  @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
  @updateCandidateInformationChangeCategoryDescription={{this.updateCandidateInformationChangeCategory}}
/>`);
    await click(screen.getByRole('radio'));

    // then
    assert.dom(screen.getByRole('button', { name: 'Sélectionnez une sous-catégorie :' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Renseignez les informations correctes' })).exists();
  });

  test('it should show "Précisez le temps majoré" if subcategory EXTRA_TIME_PERCENTAGE is selected', async function (assert) {
    // given
    const toggleOnCategory = sinon.stub();
    const updateCandidateInformationChangeCategory = sinon.stub();
    const candidateInformationChangeCategory = {
      isChecked: true,
      subcategory: certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
    };
    this.set('toggleOnCategory', toggleOnCategory);
    this.set('candidateInformationChangeCategory', candidateInformationChangeCategory);
    this.set('updateCandidateInformationChangeCategory', updateCandidateInformationChangeCategory);

    // when
    const screen = await render(hbs`<IssueReportModal::CandidateInformationChangeCertificationIssueReportFields
  @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
  @toggleOnCategory={{this.toggleOnCategory}}
  @maxlength={{500}}
  @updateCandidateInformationChangeCategoryDescription={{this.updateCandidateInformationChangeCategory}}
/>`);
    await click(screen.getByRole('radio'));

    // then
    assert.dom(screen.getByRole('button', { name: 'Sélectionnez une sous-catégorie :' })).exists();
    assert.dom(screen.getByRole('textbox', { name: 'Précisez le temps majoré' })).exists();
  });
});
