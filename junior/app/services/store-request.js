import Service, { service } from '@ember/service';
import { cacheKeyFor } from '@warp-drive/core';
import { createRecord, findRecord, postQuery, query } from '@warp-drive/utilities/json-api';

export default class StoreRequest extends Service {
  @service store;

  async createRecord(name, data = {}, { requestOptions, bodyOptions } = {}) {
    const record = this.store.createRecord(name, data);
    const request = createRecord(record, requestOptions);
    request.body = JSON.stringify({ data: this.store.cache.peek(cacheKeyFor(record)), ...bodyOptions });
    return this.store.request(request);
  }

  async findRecord(name, data, options) {
    return this.store.request(findRecord(name, data, options));
  }

  async query(name, params, options) {
    return this.store.request(query(name, params, options));
  }

  async queryRecord(name, params, options) {
    return this.query(name, params, { ...options, reload: true });
  }

  async postQuery(name, params, options) {
    return this.store.request(postQuery(name, params, options));
  }
}
