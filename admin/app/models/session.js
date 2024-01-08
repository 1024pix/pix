import isEmpty from 'lodash/isEmpty';
import sumBy from 'lodash/sumBy';
import trim from 'lodash/trim';

import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import { memberAction } from 'ember-api-actions';

function _getNumberOf(juryCertificationSummaries, booleanFct) {
  return sumBy(juryCertificationSummaries.toArray(), (juryCertificationSummary) =>
    Number(booleanFct(juryCertificationSummary)),
  );
}

export const CREATED = 'created';
export const FINALIZED = 'finalized';
export const IN_PROCESS = 'in_process';
export const PROCESSED = 'processed';
export const statusToDisplayName = {
  [CREATED]: 'Créée',
  [FINALIZED]: 'Finalisée',
  [IN_PROCESS]: 'En cours de traitement',
  [PROCESSED]: 'Résultats transmis par Pix',
};

export default class Session extends Model {
  @attr() certificationCenterType;
  @attr() certificationCenterName;
  @attr() certificationCenterId;
  @attr() certificationCenterExternalId;
  @attr() address;
  @attr() room;
  @attr() examiner;
  @attr('date-only') date;
  @attr() time;
  @attr() accessCode;
  @attr() status;
  @attr() description;
  @attr() examinerGlobalComment;
  @attr() finalizedAt;
  @attr() resultsSentToPrescriberAt;
  @attr() publishedAt;
  @attr() juryComment;
  @attr() juryCommentedAt;
  @attr('boolean') hasIncident;
  @attr('boolean') hasJoiningIssue;
  @attr('boolean') hasSupervisorAccess;
  @attr() version;

  @hasMany('jury-certification-summary') juryCertificationSummaries;
  @belongsTo('user') assignedCertificationOfficer;
  @belongsTo('user') juryCommentAuthor;

  @computed('status')
  get isFinalized() {
    return this.status === FINALIZED || this.status === IN_PROCESS || this.status === PROCESSED;
  }

  @computed('examinerGlobalComment')
  get hasExaminerGlobalComment() {
    return !isEmpty(trim(this.examinerGlobalComment));
  }

  get hasComplementaryInfo() {
    return Boolean(this.hasIncident || this.hasJoiningIssue);
  }

  @computed('status')
  get isPublished() {
    return this.status === PROCESSED;
  }

  @computed('juryCertificationSummaries.[]')
  get countCertificationIssueReports() {
    const reducer = (totalOfCertificationIssueReports, juryCertificationSummary) => {
      const numberOfCertificationIssueReports = juryCertificationSummary.numberOfCertificationIssueReports
        ? juryCertificationSummary.numberOfCertificationIssueReports
        : 0;
      return totalOfCertificationIssueReports + numberOfCertificationIssueReports;
    };
    return this.juryCertificationSummaries.reduce(reducer, 0);
  }

  @computed('juryCertificationSummaries.[]')
  get countCertificationIssueReportsWithActionRequired() {
    const reducer = (totalOfCertificationIssueReports, juryCertificationSummary) => {
      const numberOfCertificationIssueReportsWithRequiredAction =
        juryCertificationSummary.numberOfCertificationIssueReportsWithRequiredAction
          ? juryCertificationSummary.numberOfCertificationIssueReportsWithRequiredAction
          : 0;
      return totalOfCertificationIssueReports + numberOfCertificationIssueReportsWithRequiredAction;
    };
    return this.juryCertificationSummaries.reduce(reducer, 0);
  }

  @computed('juryCertificationSummaries.[]')
  get countNotCheckedEndScreen() {
    return _getNumberOf(
      this.juryCertificationSummaries,
      (juryCertificationSummary) => !juryCertificationSummary.hasSeenEndTestScreen,
    );
  }

  @computed('juryCertificationSummaries.@each.status')
  get countStartedAndInErrorCertifications() {
    return _getNumberOf(
      this.juryCertificationSummaries,
      (juryCertificationSummary) =>
        juryCertificationSummary.isCertificationStarted || juryCertificationSummary.isCertificationInError,
    );
  }

  @computed('juryCertificationSummaries.@each.isFlaggedAborted')
  get countCertificationsFlaggedAsAborted() {
    return _getNumberOf(
      this.juryCertificationSummaries,
      (juryCertificationSummary) => juryCertificationSummary.isFlaggedAborted,
    );
  }

  @computed('resultsSentToPrescriberAt', 'isFinalized')
  get areResultsToBeSentToPrescriber() {
    return Boolean(this.isFinalized && !this.resultsSentToPrescriberAt);
  }

  @computed('status')
  get displayStatus() {
    return statusToDisplayName[this.status];
  }

  @computed('hasSupervisorAccess')
  get displayHasSeenEndTestScreenColumn() {
    return !this.hasSupervisorAccess;
  }

  getDownloadLink = memberAction({
    path: 'generate-results-download-link',
    type: 'get',
    urlType: 'findRecord',
    before(attributes) {
      return { lang: attributes.lang };
    },
    after(response) {
      return response.sessionResultsLink;
    },
  });

  comment = memberAction({
    path: 'comment',
    type: 'put',
    urlType: 'updateRecord',
    after() {
      this.reload();
    },
  });

  deleteComment = memberAction({
    path: 'comment',
    type: 'delete',
    urlType: 'updateRecord',
  });
}
