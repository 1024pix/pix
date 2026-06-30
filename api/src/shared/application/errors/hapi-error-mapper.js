import kebabCase from 'lodash/kebabCase.js';

import { DomainError, EntityValidationError } from '../../domain/errors.js';
import { getBaseLocale } from '../../domain/services/locale-service.js';
import { getI18n } from '../../infrastructure/i18n/i18n.js';
import { getChallengeLocale } from '../../infrastructure/utils/request-response-utils.js';
import { mapToHttpError } from './error-manager.js';
import { BaseHttpError, InvalidEntityError, sendJsonApiError } from './http-errors.js';

const NOT_VALID_RELATIONSHIPS = ['externalId', 'participantExternalId'];

export class HapiErrorMapper {
  #registry;

  constructor(registry) {
    this.#registry = registry;
  }

  handle(request, h) {
    const { response } = request;

    if (response instanceof BaseHttpError) {
      return sendJsonApiError(response, h);
    }

    if (response instanceof EntityValidationError) {
      const locale = getChallengeLocale(request);
      const language = getBaseLocale(locale);
      const jsonApiError = response.invalidAttributes?.map((invalidAttribute) =>
        this.#formatInvalidAttribute(language, response.meta, invalidAttribute),
      );
      return sendJsonApiError(jsonApiError ?? new InvalidEntityError(), h);
    }

    if (response instanceof DomainError) {
      const httpError = this.#registry.mapToError(response) ?? mapToHttpError(response);
      return sendJsonApiError(httpError, h);
    }
    return h.continue;
  }

  #formatInvalidAttribute(locale, meta, { attribute, message }) {
    if (!attribute) {
      return this.#formatUndefinedAttribute({ message, locale, meta });
    }
    if (attribute.endsWith('Id') && !NOT_VALID_RELATIONSHIPS.includes(attribute)) {
      return this.#formatRelationship({ attribute, message, locale, meta });
    }
    return this.#formatAttribute({ attribute, message, locale, meta });
  }

  #formatUndefinedAttribute({ message, locale, meta }) {
    return new InvalidEntityError({
      message: this.#translateMessage(locale, message),
      code: undefined,
      meta,
      source: undefined,
      title: 'Invalid data attributes',
    });
  }

  #formatRelationship({ attribute, message, locale, meta }) {
    const relationship = attribute.replace('Id', '');
    return new InvalidEntityError({
      message: this.#translateMessage(locale, message),
      code: undefined,
      meta,
      source: {
        pointer: `/data/relationships/${kebabCase(relationship)}`,
      },
      title: `Invalid relationship "${relationship}"`,
    });
  }

  #formatAttribute({ attribute, message, locale, meta }) {
    return new InvalidEntityError({
      message: this.#translateMessage(locale, message),
      code: undefined,
      meta,
      source: {
        pointer: `/data/attributes/${kebabCase(attribute)}`,
      },
      title: `Invalid data attribute "${attribute}"`,
    });
  }

  #translateMessage(locale, key) {
    const i18n = getI18n(locale);
    if (!key) return key;

    // use regexp to remove i18n key special chars from key
    const i18nKey = `entity-validation-errors.${key}`.replace(/[:{}%]/g, '');
    const translation = i18n.__(i18nKey);

    // when the i18n key is returned, so the translation does not exist
    if (translation === i18nKey) return key;

    return translation;
  }
}
