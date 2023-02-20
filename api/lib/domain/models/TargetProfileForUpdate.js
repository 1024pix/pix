import { validate } from '../validators/target-profile/base-validation';
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

export default TargetProfileForUpdate;
