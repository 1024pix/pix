import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { certificationIssueReportCategoriesLabel } from 'pix-certif/models/certification-issue-report';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | examiner-report-modal', function(hooks) {
  setupRenderingTest(hooks);

  const LABEL_FOR_RADIO_BUTTON_OF_TYPE_OTHER_SELECTOR = 'label[for="input-radio-for-type-other"]';
  const LABEL_FOR_RADIO_BUTTON_OF_TYPE_LATE_OR_LEAVING_SELECTOR = 'label[for="input-radio-for-type-late-or-leaving"]';
  const TEXT_AREA_OF_TYPE_OTHER_SELECTOR = '#text-area-for-type-other';
  const TEXT_AREA_OF_TYPE_LATE_OR_LEAVING_SELECTOR = '#text-area-for-type-late-or-leaving';
  const REPORT_INPUT_LENGTH_INDICATOR = '.examiner-report-modal-content__char-count';

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

  module('when there is already an issue report', function() {
    module('when the issue report is of type OTHER', function() {
      test('it should show OTHER textearea already filled', async function(assert) {
        // given
        const certificationCourseId = 1;
        const certificationIssueReport = EmberObject.create({
          category: certificationIssueReportCategoriesLabel.OTHER,
          description: 'coucou',
        });
        const report = EmberObject.create({
          certificationCourseId,
          firstName: 'Lisa',
          lastName: 'Monpud',
          certificationIssueReports: [ certificationIssueReport ],
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
        const textAreaElement = document.querySelector(TEXT_AREA_OF_TYPE_OTHER_SELECTOR);
        assert.dom(TEXT_AREA_OF_TYPE_LATE_OR_LEAVING_SELECTOR).doesNotExist();
        assert.equal(textAreaElement.value, 'coucou');
        assert.dom(REPORT_INPUT_LENGTH_INDICATOR).hasText(`${certificationIssueReport.description.length} / 500`);
      });
    });

    module('when the issue report is of type LATE_OR_LEAVING', function() {
      test('it should show LATE_OR_LEAVING textearea already filled', async function(assert) {
        // given
        const certificationCourseId = 1;
        const certificationIssueReport = EmberObject.create({
          category: certificationIssueReportCategoriesLabel.LATE_OR_LEAVING,
          description: 'coucou',
        });
        const report = EmberObject.create({
          certificationCourseId,
          firstName: 'Lisa',
          lastName: 'Monpud',
          certificationIssueReports: [ certificationIssueReport ],
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
        const textAreaElement = document.querySelector(TEXT_AREA_OF_TYPE_LATE_OR_LEAVING_SELECTOR);
        assert.dom(TEXT_AREA_OF_TYPE_OTHER_SELECTOR).doesNotExist();
        assert.equal(textAreaElement.value, 'coucou');
        assert.dom(REPORT_INPUT_LENGTH_INDICATOR).hasText(`${certificationIssueReport.description.length} / 500`);
      });
    });
  });

  module('when there is no issue report yet', function() {
    test('it should show all categories label', async function(assert) {
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
      assert.dom(TEXT_AREA_OF_TYPE_OTHER_SELECTOR).doesNotExist();
      assert.dom(TEXT_AREA_OF_TYPE_LATE_OR_LEAVING_SELECTOR).doesNotExist();
      assert.dom(LABEL_FOR_RADIO_BUTTON_OF_TYPE_OTHER_SELECTOR).hasText('Autre incident');
      assert.dom(LABEL_FOR_RADIO_BUTTON_OF_TYPE_LATE_OR_LEAVING_SELECTOR).hasText('Retard, absence ou départ');
    });
  });
});
