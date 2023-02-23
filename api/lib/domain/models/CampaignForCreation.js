const validate = require('../validators/campaign-creation-validator.js');
class CampaignForCreation {
  constructor({
    name,
    title,
    idPixLabel,
    customLandingPageText,
    type,
    targetProfileId,
    creatorId,
    ownerId,
    organizationId,
    multipleSendings,
    code,
  } = {}) {
    this.name = name;
    this.title = title;
    this.idPixLabel = idPixLabel;
    this.customLandingPageText = customLandingPageText;
    this.type = type;
    this.targetProfileId = targetProfileId;
    this.creatorId = creatorId;
    this.ownerId = ownerId;
    this.organizationId = organizationId;
    this.multipleSendings = multipleSendings;
    this.code = code;
    validate(this);
  }
}

module.exports = CampaignForCreation;
