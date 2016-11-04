'use strict';

const JSONAPISerializer = require('./jsonapi-serializer');

class SolutionSerializer extends JSONAPISerializer {

  constructor() {
    super('challenges');
  }

  serializeAttributes(model, data) {
    data.attributes["type"] = model.type;
    data.attributes["value"] = model.value;
  }
}

module.exports = new SolutionSerializer();
