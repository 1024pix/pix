'use strict';

const JSONAPISerializer = require('./jsonapi-serializer');

class ChallengeSerializer extends JSONAPISerializer {

  constructor() {
    super('challenges');
  }

  serializeAttributes(model, data) {
    data.attributes["type"] = model.type;
    data.attributes["instruction"] = model.instruction;
    data.attributes["proposals"] = model.proposals;

    if (model.illustrationUrl) {
      data.attributes["illustration-url"] = model.illustrationUrl;
    }

    if (model.attachmentUrl) {
      data.attributes["attachment-url"] = model.attachmentUrl;
      data.attributes["attachment-filename"] = model.attachmentFilename;
    }
  }
}

module.exports = new ChallengeSerializer();
