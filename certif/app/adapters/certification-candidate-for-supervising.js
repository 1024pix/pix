import ApplicationAdapter from './application';

export default class CertificationCandidateForSupervisingAdapter extends ApplicationAdapter {
  async updateAuthorizedToStart({ candidateId, authorizedToStart }) {
    return this.ajax(
      `${this.host}/${this.namespace}/certification-candidates/${candidateId}/authorize-to-start`,
      'POST',
      {
        data: {
          'authorized-to-start': authorizedToStart,
        },
      },
    );
  }

  async authorizeTestResume({ candidateId }) {
    return this.ajax(
      `${this.host}/${this.namespace}/certification-candidates/${candidateId}/authorize-to-resume`,
      'POST',
    );
  }

  async endAssessmentByInvigilator({ candidateId }) {
    return this.ajax(
      `${this.host}/${this.namespace}/certification-candidates/${candidateId}/end-assessment-by-invigilator`,
      'PATCH',
    );
  }
}
