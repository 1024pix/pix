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
      return this.ajax(this.urlForUpdateJuryComment(snapshot.id), 'PATCH', { data: payload });
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

  buildURL(modelName, id, snapshot, requestType, query) {
    if (['cancel', 'uncancel', 'reject', 'unreject'].includes(requestType)) {
      return `${this.host}/${this.namespace}/admin/certification-courses/${id}/${requestType}`;
    }

    if (requestType === 'edit-jury-level') {
      return `${this.host}/${this.namespace}/admin/complementary-certification-course-results`;
    }
    return super.buildURL(modelName, id, snapshot, requestType, query);
  }
}
