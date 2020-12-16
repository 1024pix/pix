import ApplicationAdapter from './application';

export default class SessionAdapter extends ApplicationAdapter {

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);
    if (adapterOptions && adapterOptions.finalization) {
      delete adapterOptions.finalization;
      return url + '/finalization';
    }

    return url;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions) {
      if (snapshot.adapterOptions.finalization) {
        const model = snapshot.record;
        const mustIncludeFormerExaminerComment = snapshot.adapterOptions.isReportsCategorizationFeatureToggleEnabled !== true;
        const data = {
          data: {
            attributes: {
              'examiner-global-comment': model.examinerGlobalComment,
            },
            included: model.certificationReports
              .map((certificationReport) => {
                const certificationReportDTO = {
                  type: 'certification-reports',
                  id: certificationReport.get('id'),
                  attributes: { ...certificationReport.toJSON() },
                };
                if (mustIncludeFormerExaminerComment) {
                  certificationReportDTO.attributes.examinerComment = certificationReport.firstIssueReportDescription
                    ? certificationReport.firstIssueReportDescription
                    : null;
                }
                return certificationReportDTO;
              }),
          },
        };
        return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PUT', { data });
      }

      if (snapshot.adapterOptions.studentListToAdd) {
        const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/enroll-students-to-session';
        const studentIds = snapshot.adapterOptions.studentListToAdd.map((student) => student.id);
        const data = {
          data: {
            attributes: {
              'student-ids': studentIds,
            },
          },
        };

        return this.ajax(url, 'PUT', { data });
      }
    }

    return super.updateRecord(...arguments);
  }
}
