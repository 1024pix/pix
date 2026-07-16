import ApplicationAdapter from './application';

export default class CertificationVersionAdapter extends ApplicationAdapter {
  updateRecord(store, type, snapshot) {
    const certificationVersionId = snapshot.id;

    let url = `${this.host}/${this.namespace}/certification-versions/${certificationVersionId}`;

    const changedAttributeKeys = Object.keys(snapshot.changedAttributes());
    if (changedAttributeKeys.length === 1 && changedAttributeKeys.at(0) === 'comments') {
      url += '/comments';
    }

    const data = this.serialize(snapshot, { includeId: true });
    return this.ajax(url, 'PATCH', { data });
  }

  createRecord(store, type, snapshot) {
    if (!snapshot.adapterOptions.scope) {
      return super.createRecord(...arguments);
    }

    const url = `${this.host}/${this.namespace}/certification-versions`;
    const payload = {
      data: {
        attributes: {
          tubeIds: snapshot.adapterOptions.tubeIds,
          scope: snapshot.adapterOptions.scope,
        },
      },
    };

    return this.ajax(url, 'POST', { data: payload });
  }
}
