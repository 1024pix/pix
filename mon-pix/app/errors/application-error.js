export class ApplicationError extends Error {
  constructor({ cause, extras, message }) {
    super(message, { cause });
    this._extras = extras;
  }

  get extras() {
    return this._extras;
  }
}
