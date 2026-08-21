import { PixBlock } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { DescriptionList } from 'pix-admin/components/ui/description-list';

import CertificationCompetenceList from '../competence-list';
import CertificationComments from './comments';
import CertificationInformationCandidate from './informations/candidate';
import CertificationInformationGlobalActions from './informations/global-actions';
import CertificationInformationIssueReports from './informations/issue-reports';
import PixPlusEduV2Results from './informations/pix-plus-edu-v2-results';
import PixPlusEduV3Results from './informations/pix-plus-edu-v3-results';
import CertificationInformationState from './informations/state';

export default class CertificationInformations extends Component {
  get shouldDisplayV2EduResult() {
    return this.args.certification.isPixPlusEdu && !this.args.certification.isV3;
  }

  get shouldDisplayV3EduResult() {
    return (
      this.args.certification.isPixPlusEdu &&
      this.args.certification.isV3 &&
      this.args.certification.status === 'validated'
    );
  }

  <template>
    <div class="certification-information">
      <div class="certification-information__buttons-row">
        <CertificationInformationGlobalActions @certification={{@certification}} @session={{@session}} />
      </div>
      <div class="certification-information__block-row">
        <CertificationInformationState @certification={{@certification}} @session={{@session}} />
        <CertificationInformationCandidate @certification={{@certification}} />
      </div>
      <div>
        {{#if @certification.commonComplementaryCertificationCourseResult.content}}
          <PixBlock @variant="admin">
            <h2 class="certification-information__title">Certification complémentaire</h2>

            <DescriptionList
              data-testid="pw-certification-information-complementary"
              class="certification-information-complementary"
            >
              <DescriptionList.Item @label={{@certification.commonComplementaryCertificationCourseResult.label}}>
                {{@certification.commonComplementaryCertificationCourseResult.status}}
              </DescriptionList.Item>
            </DescriptionList>
          </PixBlock>
        {{/if}}
        {{#if this.shouldDisplayV2EduResult}}
          <PixBlock @variant="admin">
            <PixPlusEduV2Results
              @certification={{@certification}}
              @displayJuryLevelSelect={{@displayJuryLevelSelect}}
              @juryLevelOptions={{@juryLevelOptions}}
              @selectedJuryLevel={{@selectedJuryLevel}}
              @selectJuryLevel={{@selectJuryLevel}}
              @onCancelJuryLevelEditButtonClick={{@onCancelJuryLevelEditButtonClick}}
              @onEditJuryLevelSave={{@onEditJuryLevelSave}}
              @shouldDisplayJuryLevelEditButton={{@shouldDisplayJuryLevelEditButton}}
              @editJury={{@editJury}}
            />
          </PixBlock>
        {{/if}}
        {{#if this.shouldDisplayV3EduResult}}
          <PixBlock @variant="admin">
            <PixPlusEduV3Results @certification={{@certification}} />
          </PixBlock>
        {{/if}}
      </div>

      {{#if @certificationIssueReports.length}}
        <section class="certification-informations__row">
          <CertificationInformationIssueReports
            @certificationIssueReports={{@certificationIssueReports}}
            @certification={{@certification}}
          />
        </section>
      {{/if}}

      <CertificationComments @onJuryCommentSave={{@onJuryCommentSave}} @certification={{@certification}} />

      {{#if @certification.competences.length}}
        <PixBlock @variant="admin" class="certification-information-results">
          <h2 class="certification-information__title">Résultats</h2>

          <CertificationCompetenceList
            @competences={{@certification.competences}}
            @shouldDisplayPixScore={{@shouldDisplayPixScore}}
          />
        </PixBlock>
      {{/if}}
    </div>
  </template>
}
