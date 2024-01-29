export default class JSONApiError extends Error {
  constructor(message, extras) {
    super(message);
    this._extras = extras;
  }

  get code() {
    return this._extras?.code;
  }

  get meta() {
    return this._extras?.meta;
  }

  get shortCode() {
    return this._extras?.meta?.shortCode;
  }

  get detail() {
    return this._extras?.detail;
  }

  get title() {
    return this._extras?.title;
  }

  get status() {
    return this._extras?.status;
  }
}
