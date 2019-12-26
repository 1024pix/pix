import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  finalize(model) {
    const url = `${this.buildURL('session', model.id)}/finalization`;

    // Here we try to respect the JSON-API format
    // so the API knows how to handle this payload
    return this.ajax(url, 'PUT', {
      data: {
        data: {
          attributes: {
            'examiner-comment': model.get('examinerComment'),
          },
          included: model.get('certificationCandidates')
            .filter((certificationCandidate) => certificationCandidate.hasDirtyAttributes)
            .map((certificationCandidate) => ({
              type: 'certification-candidates',
              id: certificationCandidate.get('id'),
              attributes: certificationCandidate.toJSON(),
            })),
        },
      },
    });
  },

});
