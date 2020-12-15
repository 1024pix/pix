import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | examiner-report-modal', function(hooks) {
  setupRenderingTest(hooks);

  const LABEL_FOR_RADIO_BUTTON_OF_CATEGORY_OTHER_SELECTOR = 'label[for="input-radio-for-category-other"]';
  const LABEL_FOR_RADIO_BUTTON_OF_CATEGORY_LATE_OR_LEAVING_SELECTOR = 'label[for="input-radio-for-category-late-or-leaving"]';
  const TEXT_AREA_OF_CATEGORY_OTHER_SELECTOR = '#text-area-for-category-other';
  const TEXT_AREA_OF_CATEGORY_LATE_OR_LEAVING_SELECTOR = '#text-area-for-category-late-or-leaving';

  test('it show candidate informations in title', async function(assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      hasSeenEndTestScreen: false,
    });
    const closeExaminerReportModalStub = sinon.stub();
    this.set('closeExaminerReportModal', closeExaminerReportModalStub);
    this.set('reportToEdit', report);
    this.set('maxlength', 500);

    // when
    await render(hbs`
      <ExaminerReportModal
        @closeModal={{this.closeExaminerReportModal}}
        @report={{this.reportToEdit}}
        @maxlength={{@issueReportDescriptionMaxLength}}
      />
    `);

    // then
    const reportModalTitleSelector = '.examiner-report-modal__title h3';
    assert.dom(reportModalTitleSelector).hasText('Lisa Monpud');
  });

  module('when there is no issue report yet', function() {
    test('it should show all categories label', async function(assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        hasSeenEndTestScreen: false,
      });
      const closeExaminerReportModalStub = sinon.stub();
      this.set('closeExaminerReportModal', closeExaminerReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);

      // when
      await render(hbs`
        <ExaminerReportModal
          @closeModal={{this.closeExaminerReportModal}}
          @report={{this.reportToEdit}}
          @maxlength={{@issueReportDescriptionMaxLength}}
        />
      `);

      // then
      assert.dom(TEXT_AREA_OF_CATEGORY_OTHER_SELECTOR).doesNotExist();
      assert.dom(TEXT_AREA_OF_CATEGORY_LATE_OR_LEAVING_SELECTOR).doesNotExist();
      assert.dom(LABEL_FOR_RADIO_BUTTON_OF_CATEGORY_OTHER_SELECTOR).hasText('Autre incident');
      assert.dom(LABEL_FOR_RADIO_BUTTON_OF_CATEGORY_LATE_OR_LEAVING_SELECTOR).hasText('Retard, absence ou départ');
    });
  });
});
