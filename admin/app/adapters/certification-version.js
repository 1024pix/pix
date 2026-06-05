import ApplicationAdapter from './application';

export default class CertificationVersionAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  updateRecord(store, type, snapshot) {
    const certificationVersionId = snapshot.id;
    const url = `${this.host}/${this.namespace}/certification-versions/${certificationVersionId}`;
    const data = this.serialize(snapshot, { includeId: true });
    return this.ajax(url, 'PATCH', { data });
  }

  createDraft({ scope, tubeIds }) {
    const url = `${this.host}/${this.namespace}/frameworks/${scope}/version`;
    const data = {
      data: {
        attributes: {
          tubeIds,
        },
      },
    };
    return this.ajax(url, 'POST', { data });
  }
}
