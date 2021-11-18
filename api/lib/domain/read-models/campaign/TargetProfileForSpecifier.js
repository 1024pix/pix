const _ = require('lodash');

class TargetProfileForSpecifier {
  constructor({ id, name, skills, thematicResults, hasStage, description }) {
    this.id = id;
    this.name = name;
    this.tubeCount = _(skills).map('tubeId').uniq().size();
    this.thematicResultCount = thematicResults.length;
    this.hasStage = hasStage;
    this.description = description;
  }
}

module.exports = TargetProfileForSpecifier;
