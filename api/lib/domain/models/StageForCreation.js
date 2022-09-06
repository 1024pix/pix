const { validate } = require('../validators/stage/creation-command-validation');

class StageForCreation {
  constructor({ title, message, level, threshold, targetProfileId }) {
    this.title = title;
    this.message = message;
    this.level = level;
    this.threshold = threshold;
    this.targetProfileId = targetProfileId;
  }

  static fromCreationCommand(creationCommand) {
    validate(creationCommand);
    return new StageForCreation({
      title: creationCommand.title,
      message: creationCommand.message,
      level: creationCommand.level,
      threshold: creationCommand.threshold,
      targetProfileId: creationCommand.targetProfileId,
    });
  }
}

module.exports = StageForCreation;
