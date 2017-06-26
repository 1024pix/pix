const AirtableModel = require('./airtable-model');
const extend = require('util')._extend;

class courseGroup extends AirtableModel {

  constructor(object) {
    super();
    extend(this, object);
  }

  toJSON() {
    return super.toJSON();
  }
}

module.exports = courseGroup;
