class DomainError extends Error {
  constructor(message, code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class ActivityNotFoundError extends DomainError {
  constructor(message = 'Erreur, activitée introuvable.', code) {
    super(message);
    this.code = code;
  }
}

export { ActivityNotFoundError };
