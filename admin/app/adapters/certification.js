import ApplicationAdapter from './application';

export default class Certification extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/certifications/${id}`;
  }

  urlForUpdateJuryComment(id) {
    return `${this.host}/${this.namespace}/admin/certification-courses/${id}/assessment-results`;
  }

  urlForUpdateRecord(certificationCourseId) {
    return `${this.host}/${this.namespace}/admin/certification-courses/${certificationCourseId}`;
  }

  urlForCancelCertification(certificationCourseId) {
    return `${this.host}/${this.namespace}/admin/certification-courses/${certificationCourseId}/cancel`;
  }

  urlForUncancelCertification(certificationCourseId) {
    return `${this.host}/${this.namespace}/admin/certification-courses/${certificationCourseId}/uncancel`;
  }

  urlForRejectCertification(certificationCourseId) {
    return `${this.host}/${this.namespace}/admin/certification-courses/${certificationCourseId}/reject`;
  }

  urlForUnrejectCertification(certificationCourseId) {
    return `${this.host}/${this.namespace}/admin/certification-courses/${certificationCourseId}/unreject`;
  }

  urlForEditJuryLevel() {
    return `${this.host}/${this.namespace}/admin/complementary-certification-course-results`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.updateJuryComment) {
      const {
        data: { attributes },
      } = this.serialize(snapshot);
      const payload = {
        data: {
          attributes: {
            'comment-by-jury': attributes['comment-by-jury'],
          },
        },
      };
      return this.ajax(this.urlForUpdateJuryComment(snapshot.id), 'POST', { data: payload });
    } else if (snapshot.adapterOptions.isCertificationCancel) {
      return this.ajax(this.urlForCancelCertification(snapshot.id), 'PATCH');
    } else if (snapshot.adapterOptions.isCertificationUncancel) {
      return this.ajax(this.urlForUncancelCertification(snapshot.id), 'PATCH');
    } else if (snapshot.adapterOptions.isCertificationReject) {
      return this.ajax(this.urlForRejectCertification(snapshot.id), 'PATCH');
    } else if (snapshot.adapterOptions.isCertificationUnreject) {
      return this.ajax(this.urlForUnrejectCertification(snapshot.id), 'PATCH');
    } else if (snapshot.adapterOptions.isJuryLevelEdit) {
      const payload = {
        data: {
          attributes: {
            juryLevel: snapshot.adapterOptions.juryLevel,
            complementaryCertificationCourseId: snapshot.adapterOptions.complementaryCertificationCourseId,
          },
        },
      };

      return this.ajax(this.urlForEditJuryLevel(snapshot.id), 'POST', { data: payload });
    } else {
      const data = {};
      const serializer = store.serializerFor(type.modelName);
      serializer.serializeIntoHash(data, type, snapshot, { includeId: true, onlyInformation: true });
      return this.ajax(this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord'), 'PATCH', { data: data });
    }
  }

  ajaxOptions(url, type) {
    const hash = super.ajaxOptions(...arguments);
    if (type === 'POST') {
      hash.dataType = '*';
    }
    return hash;
  }
}
