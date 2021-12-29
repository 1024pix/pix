const { validate } = require('../validators/target-profile-validator');
class TargetProfileForUpdate {
  constructor({ id, name, description, comment, category }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.comment = comment;
    this.category = category;
  }

  update({ name, description, comment, category }) {
    this.name = name;
    this.description = description;
    this.comment = comment;
    this.category = category;
    validate(this);
  }
}

module.exports = TargetProfileForUpdate;
