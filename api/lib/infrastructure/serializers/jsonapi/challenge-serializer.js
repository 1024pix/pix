const JSONAPISerializer = require('./jsonapi-serializer');

class ChallengeSerializer extends JSONAPISerializer {

  constructor() {
    super('challenges');
  }

  serializeAttributes(model, data) {
    data.attributes['type'] = model.type;
    data.attributes['instruction'] = model.instruction;
    data.attributes['proposals'] = model.proposals;
    data.attributes['hasnt-internet-allowed'] = model.hasntInternetAllowed;
    data.attributes['timer'] = model.timer;

    if (model.illustrationUrl) {
      data.attributes['illustration-url'] = model.illustrationUrl;
    }

    if (model.attachments) {
      data.attributes['attachments'] = model.attachments;
    }
  }
}

module.exports = new ChallengeSerializer();
