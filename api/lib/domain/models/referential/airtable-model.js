'use strict';

const extend = require('util')._extend;

class AirtableModel {

  constructor(record) {
    if (record) {
      this.record = record;
      this.id = this.record.id;
      this.initialize();
    }
  }

  initialize() {
  }

  toJSON() {
    const json = extend({}, this);
    delete json.record;
    return json;
  }

}

module.exports = AirtableModel;
