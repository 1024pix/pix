import { DomainError } from '../../../shared/domain/errors.js';

class OrganizationCantGetPlacesStatisticsError extends DomainError {
  constructor() {
    const message = `L'organisation ne peut pas avoir de statistiques sur ses lots de places.`;
    super(message);
  }
}

export { OrganizationCantGetPlacesStatisticsError };
