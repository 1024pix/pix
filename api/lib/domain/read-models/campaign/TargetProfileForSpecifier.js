const { uniqBy } = require('lodash');

class TargetProfileForSpecifier {
  constructor({ id, name, skills, thematicResults, hasStage, description, category }) {
    this.id = id;
    this.name = name;
    this.tubeCount = uniqBy(skills, 'tubeId').length;
    this.thematicResultCount = thematicResults.length;
    this.hasStage = hasStage;
    this.description = description;
    this.category = category;
  }
}

module.exports = TargetProfileForSpecifier;
