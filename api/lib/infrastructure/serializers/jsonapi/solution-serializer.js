const JSONAPISerializer = require('./jsonapi-serializer');

class SolutionSerializer extends JSONAPISerializer {

  constructor() {
    super('solutions');
  }

  serializeAttributes(model, data) {
    data.attributes['value'] = model.value;
  }
}

module.exports = new SolutionSerializer();
