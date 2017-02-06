const extend = require('util')._extend;

class AirtableModel {

  toJSON() {
    return extend({}, this);
  }

}

module.exports = AirtableModel;
