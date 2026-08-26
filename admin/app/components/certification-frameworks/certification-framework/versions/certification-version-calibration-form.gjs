import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { eq } from 'ember-truth-helpers';
import Card from 'pix-admin/components/card';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

export default class CalibrationForm extends Component {
  @service pixToast;
  @service intl;
  @tracked showMoreInfoForLines = [];

  get report() {
    return this.args.calibrationReport;
  }

  get hasHighAlert() {
    if (!this.report) return true;
    return this.report.reportLines.some((line) => line.alertLevel === 'HIGH');
  }

  get isCalibrationIdAlreadySaved() {
    return this.report?.calibrationId === this.args.draftVersion.externalCalibrationId;
  }

  get isValidationDisabled() {
    return this.hasHighAlert || this.isCalibrationIdAlreadySaved;
  }

  get translatedReportLines() {
    const translatedReportLines = [];
    let i = 1;
    for (const reportLine of this.report.reportLines) {
      const translatedReportLine = {
        lineNumber: i,
        label: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.calibration.label-for-' +
            reportLine.label,
        ),
        alertLevel: reportLine.alertLevel,
        additionalContent: reportLine.additionalContent,
        isExpanded: this.showMoreInfoForLines.includes(i),
      };
      ++i;
      translatedReportLine.content = reportLine.content;
      if (reportLine.label === 'CALIBRATION_SCOPE') {
        translatedReportLine.content = this.intl.t(
          'components.certification-frameworks.certification-framework.versions.calibration.scopes.' +
            reportLine.content,
        );
      }
      if (reportLine.label === 'CALIBRATION_STATUS') {
        translatedReportLine.content = this.intl.t(
          'components.certification-frameworks.certification-framework.versions.calibration.statuses.' +
            reportLine.content,
        );
      }
      if (reportLine.label === 'MESH_SCORING_PRESENCE' || reportLine.label === 'COMPETENCE_SCORING_PRESENCE') {
        translatedReportLine.content = reportLine.content
          ? this.intl.t('common.words.yes')
          : this.intl.t('common.words.no');
      }
      translatedReportLines.push(translatedReportLine);
    }
    return translatedReportLines;
  }

  @action
  async showMoreInfo(lineNumber) {
    const index = this.showMoreInfoForLines.indexOf(lineNumber);
    if (index === -1) {
      this.showMoreInfoForLines = [...this.showMoreInfoForLines, lineNumber];
    } else {
      this.showMoreInfoForLines = this.showMoreInfoForLines.filter((lineExpanded) => lineExpanded !== lineNumber);
    }
  }

  @action
  async shouldShowMoreInfo(lineNumber) {
    return this.showMoreInfoForLines.some((lineExpanded) => lineExpanded === lineNumber);
  }

  @action
  async saveCalibrationId() {
    try {
      this.args.draftVersion.externalCalibrationId = this.report.calibrationId;
      await this.args.draftVersion.save();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(
          'components.certification-frameworks.certification-framework.versions.calibration.save-success-message',
        ),
      });
    } catch (error) {
      this.pixToast.sendErrorNotification({ message: error.errors?.[0].detail });
      return;
    }
    return;
  }

  <template>
    <Card
      class="versions-calibration"
      @title={{t "components.certification-frameworks.certification-framework.versions.calibration.title"}}
    >
      {{#if this.report}}
        <div class="versions-calibration__report">
          <span class="versions-calibration__report__title">
            {{t
              "components.certification-frameworks.certification-framework.versions.calibration.report-title"
              calibrationId=this.report.calibrationId
            }}
            {{formatDate this.report.generatedAt format="long"}}
          </span>
          <DescriptionList>
            {{#each this.translatedReportLines as |line|}}
              <DescriptionList.Item @label={{line.label}}>
                {{line.content}}
                {{#if line.alertLevel}}
                  <PixIconButton
                    class={{if
                      (eq line.alertLevel "HIGH")
                      "calibration-report__icon--high"
                      "calibration-report__icon--low"
                    }}
                    @ariaLabel={{t
                      "components.certification-frameworks.certification-framework.versions.calibration.show-additional-info"
                      lineNumber=line.lineNumber
                    }}
                    @iconName={{if (eq line.alertLevel "HIGH") "cancel" "warning"}}
                    @triggerAction={{fn this.showMoreInfo line.lineNumber}}
                  />
                {{/if}}
                {{#if line.isExpanded}}
                  <p class="calibration-report__additional-content">{{line.additionalContent}}</p>
                {{/if}}
              </DescriptionList.Item>
            {{/each}}
          </DescriptionList>
        </div>
        <PixButton
          class="versions-calibration__save-button"
          @variant="primary"
          @isDisabled={{this.isValidationDisabled}}
          @triggerAction={{this.saveCalibrationId}}
        >
          {{t
            "components.certification-frameworks.certification-framework.versions.calibration.save-button-label"
            id=this.report.calibrationId
          }}
        </PixButton>
      {{else}}
        <p class="versions-calibration__no-report">
          {{t "components.certification-frameworks.certification-framework.versions.calibration.no-report-message"}}
        </p>
      {{/if}}
    </Card>
    <section class="actions-container">
      <PixButtonLink
        @route="authenticated.certification-frameworks.certification-framework.versions.version.scoring"
        @variant="primary"
        @isDisabled={{this.hasHighAlert}}
      >
        {{t "common.actions.next"}}
      </PixButtonLink>
    </section>
  </template>
}
