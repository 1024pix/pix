import { DomainError } from '../../shared/domain/errors.js';

class StageWithLinkedCampaignError extends DomainError {
  constructor() {
    super('The stage is part of a target profile linked to a campaign');
  }
}

class EmptyAnswerError extends DomainError {
  constructor(message = 'The answer value cannot be empty', code = 'ANSWER_CANNOT_BE_EMPTY') {
    super(message, code);
  }
}

export { EmptyAnswerError, StageWithLinkedCampaignError };
