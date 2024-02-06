import ApplicationAdapter from './application';

export default class Certification extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/certifications/${id}`;
  }

  urlForUpdateComments(id) {
    return `${this.host}/${this.namespace}/admin/certification-courses/${id}/assessment-results`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/certification-courses/${id}`;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.updateComments) {
      const {
        data: { attributes },
      } = this.serialize(snapshot);
      const payload = {
        data: {
          attributes: {
            'comment-for-organization': attributes['comment-for-organization'],
            'comment-for-candidate': attributes['comment-for-candidate'],
            'comment-by-jury': attributes['comment-by-jury'],
          },
        },
      };
      return this.ajax(this.urlForUpdateComments(snapshot.id), 'POST', { data: payload });
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
