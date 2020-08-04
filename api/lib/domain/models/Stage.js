class Stage {

  constructor({
    id,
    title,
    message,
    threshold,
  } = {}) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.threshold = threshold;
  }
}

module.exports = Stage;
