import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
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
  @service store;
  @service pixToast;
  @service intl;
  @tracked calibrationId = this.args.draftVersion.externalCalibrationId ?? null;
  @tracked report = null;
  @tracked showMoreInfoForLines = [];

  get hasHighAlert() {
    if (!this.report) return true;
    return this.report.reportLines.some((line) => line.alertLevel === 'HIGH');
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
  updateCalibrationId(event) {
    this.calibrationId = Number(event.target.valueAsNumber);
  }

  @action
  async onGenerateReport(event) {
    event.preventDefault();
    let report;
    try {
      report = await this.store.queryRecord('calibration-report', {
        calibrationId: this.calibrationId,
        versionId: this.args.draftVersion.id,
      });
    } catch (error) {
      this.report = null;
      this.pixToast.sendErrorNotification({ message: error.errors?.[0].detail });
      return;
    }
    this.showMoreInfoForLines = [];
    this.report = report;
    await this.saveCalibrationId();
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
      <form id="version-calibration-form" class="versions-calibration__form" {{on "submit" this.onGenerateReport}}>
        <section>
          <PixInput
            type="number"
            value={{this.calibrationId}}
            required={{true}}
            min="0"
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{t
              "components.certification-frameworks.certification-framework.versions.edit.validation-message-error"
            }}
            {{on "change" this.updateCalibrationId}}
          >
            <:label>{{t
                "components.certification-frameworks.certification-framework.versions.calibration.calibration-id-input-label"
              }}
            </:label>
          </PixInput>
          <PixButton @type="submit" form="version-calibration-form" @variant="primary">{{t
              "components.certification-frameworks.certification-framework.versions.calibration.verify-calibration-id-button"
            }}
          </PixButton>
        </section>
      </form>
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
