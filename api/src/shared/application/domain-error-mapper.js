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
      if (this.#isDomainErrorNameAlreadyMapped(name)) {
        throw new Error(`Error ${name} already mapped`);
      }

      this.#domainErrorsHttpMappings[name] = httpErrorFn;
    });

    return this.#domainErrorsHttpMappings;
  }

  #isDomainErrorNameAlreadyMapped(name) {
    return this.#domainErrorsHttpMappings[name] && config.environment !== 'test';
  }
}

const domainErrorMapper = new DomainErrorMapper();

export { domainErrorMapper, DomainErrorMapper };
