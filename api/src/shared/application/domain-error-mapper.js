import { config } from '../config.js';

class DomainErrorMapper {
  #domainErrorsHttpMappings;

  constructor(domainErrorsHttpMappings = {}) {
    this.#domainErrorsHttpMappings = domainErrorsHttpMappings;
  }

  mapToHttpError(domainError) {
    if (this.#domainErrorsHttpMappings[domainError.name]) {
      return this.#domainErrorsHttpMappings[domainError.name](domainError);
    }
  }

  configure(domainErrorsHttpMapping) {
    domainErrorsHttpMapping.forEach(({ name, httpErrorFn }) => {
      if (this.#domainErrorsHttpMappings[name] && config.environment !== 'test') {
        throw new Error(`Error ${name} already mapped`);
      }

      this.#domainErrorsHttpMappings[name] = httpErrorFn;
    });

    return this.#domainErrorsHttpMappings;
  }
}

const domainErrorMapper = new DomainErrorMapper();

export { domainErrorMapper, DomainErrorMapper };
