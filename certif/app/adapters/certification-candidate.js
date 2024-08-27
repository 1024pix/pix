import ApplicationAdapter from './application';

export default class CertificationCandidateAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const sessionId = query.sessionId;
    if (sessionId) {
      delete query.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates`;
    }
    return super.urlForQuery(...arguments);
  }

  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);

    if (adapterOptions && adapterOptions.registerToSession) {
      delete adapterOptions.registerToSession;
      const sessionId = adapterOptions.sessionId;
      delete adapterOptions.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates`;
    }

    return url;
  }

  urlForDeleteRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForDeleteRecord(...arguments);

    if (adapterOptions && adapterOptions.sessionId) {
      const sessionId = adapterOptions.sessionId;
      delete adapterOptions.sessionId;
      return `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates/${id}`;
    }

    return url;
  }

  createRecord(store, type, snapshot) {
    const { adapterOptions } = snapshot;

    if (adapterOptions?.subscriptions) {
      const { subscriptions } = adapterOptions;
      const payload = this.serialize(snapshot);
      payload.data.attributes.subscriptions = subscriptions.map(({ type, complementaryCertificationId }) => ({
        type,
        complementaryCertificationId,
      }));
      const url = this.urlForCreateRecord('certification-candidate', { adapterOptions: snapshot.adapterOptions });

      return this.ajax(url, 'POST', { data: payload });
    }

    return super.createRecord(...arguments);
  }

  updateRecord({ candidate, sessionId }) {
    const certificationCandidateId = candidate.id;
    const payload = {
      data: {
        attributes: {
          'accessibility-adjustment-needed': candidate.accessibilityAdjustmentNeeded,
        },
      },
    };
    const url = `${this.host}/${this.namespace}/sessions/${sessionId}/certification-candidates/${certificationCandidateId}`;

    return this.ajax(url, 'PATCH', { data: payload });
  }
}
