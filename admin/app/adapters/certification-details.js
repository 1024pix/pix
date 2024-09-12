import ApplicationAdapter from './application';

export default class CertificationDetails extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/certifications/${id}/details`;
  }

  urlForNeutralizeChallenge() {
    return `${this.host}/${this.namespace}/admin/certification/neutralize-challenge`;
  }

  urlForDeneutralizeChallenge() {
    return `${this.host}/${this.namespace}/admin/certification/deneutralize-challenge`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.isNeutralizeChallenge) {
      const payload = {
        data: {
          attributes: {
            certificationCourseId: snapshot.adapterOptions.certificationCourseId,
            challengeRecId: snapshot.adapterOptions.challengeRecId,
          },
        },
      };

      return this.ajax(this.urlForNeutralizeChallenge(snapshot.id), 'POST', { data: payload });
    }
    if (snapshot.adapterOptions.isDeneutralizeChallenge) {
      const payload = {
        data: {
          attributes: {
            certificationCourseId: snapshot.adapterOptions.certificationCourseId,
            challengeRecId: snapshot.adapterOptions.challengeRecId,
          },
        },
      };

      return this.ajax(this.urlForDeneutralizeChallenge(snapshot.id), 'POST', { data: payload });
    }
  }
}
