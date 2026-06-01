import ApplicationAdapter from './application';

// TODO supprimer ce fichier + le modèle. On va faire du POST /api/admin/certification-versions
export default class CertificationConsolidatedFrameworkAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  createRecord(store, type, snapshot) {
    const scope = snapshot.attr('scope');
    const url = `${this.host}/${this.namespace}/frameworks/${scope}/version`;
    const payload = {
      data: {
        data: {
          attributes: {
            tubeIds: snapshot.hasMany('tubes').map((tube) => tube.id),
          },
        },
      },
    };

    return this.ajax(url, 'POST', payload);
  }

  findRecord(store, type, scope) {
    const url = `${this.host}/${this.namespace}/certification-frameworks/${scope}/active-consolidated-framework`;

    return this.ajax(url, 'GET');
  }
}
