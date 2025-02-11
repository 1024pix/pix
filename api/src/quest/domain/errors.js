import { DomainError } from '../../shared/domain/errors.js';

export class ComparisonNotImplementedError extends DomainError {
  constructor(comparison) {
    super(`La comparaison ${comparison} n'est pas implémentée.`, 'COMPARISON_NOT_IMPLEMENTED');
  }
}
