import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | examiner-report-modal', function(hooks) {
  setupRenderingTest(hooks);

  const RADIO_BUTTON_SELECTOR = '#report-of-type-other__radio-button';
  const LABEL_FOR_RADIO_BUTTON_SELECTOR = 'label[for="report-of-type-other__radio-button"]';
  const TEXT_AREA_SELECTOR = '#report-of-type-other__text-area';
  const REPORT_INPUT_LENGTH_INDICATOR = '.content__report-type-details p';

  test('it show candidate informations in title', async function(assert) {
    // given
    const report = EmberObject.create({
      certificationCourseId: 1,
      firstName: 'Lisa',
      lastName: 'Monpud',
      examinerComment: null,
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
        @maxlength={{@examinerCommentMaxLength}}
      />
    `);

    // then
    const reportModalTitleSelector = '.examiner-report-modal__title h3';
    assert.dom(reportModalTitleSelector).hasText('Lisa Monpud');
  });

  module('when radio button "Autre incident" is checked', function() {

    test('it should show textearea for other type report', async function(assert) {
      // given
      const examinerComment = 'coucou';
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        examinerComment,
        hasSeenEndTestScreen: false,
      });
      const closeExaminerReportModalStub = sinon.stub();
      this.set('closeExaminerReportModal', closeExaminerReportModalStub);
      this.set('reportToEdit', report);
      this.set('maxlength', 500);
      await render(hbs`
        <ExaminerReportModal
          @closeModal={{this.closeExaminerReportModal}}
          @report={{this.reportToEdit}}
          @maxlength={{@examinerCommentMaxLength}}
        />
      `);

      // when
      await click(RADIO_BUTTON_SELECTOR);

      // then
      assert.dom(TEXT_AREA_SELECTOR).exists();
      assert.dom(REPORT_INPUT_LENGTH_INDICATOR).hasText(`${examinerComment.length} / 500`);
    });
  });

  module('when radio button "Autre incident" is not checked', function() {

    test('it should only show "Autre incident" label', async function(assert) {
      // given
      const report = EmberObject.create({
        certificationCourseId: 1,
        firstName: 'Lisa',
        lastName: 'Monpud',
        examinerComment: null,
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
          @maxlength={{@examinerCommentMaxLength}}
        />
      `);
      
      // then
      assert.dom(TEXT_AREA_SELECTOR).doesNotExist();
      assert.dom(LABEL_FOR_RADIO_BUTTON_SELECTOR).hasText('Autre incident');
    });
  });

});
