import * as errorSerializer from '../infrastructure/serializers/jsonapi/error-serializer.js';
import { HttpErrors } from './http-errors.js';
import * as DomainErrors from '../domain/errors.js';
import { EntityValidationError } from '../domain/errors.js';
import jsonapiSerializer from 'jsonapi-serializer';
import { extractLocaleFromRequest } from '../../../lib/infrastructure/utils/request-response-utils.js';
import _ from 'lodash';
import * as translations from '../../../translations/index.js';
import {
  MissingOrInvalidCredentialsError,
  PasswordNotMatching,
  UserShouldChangePasswordError,
} from '../../access/shared/domain/errors.js';

const { Error: JSONAPIError } = jsonapiSerializer;
const NOT_VALID_RELATIONSHIPS = ['externalId', 'participantExternalId'];

function translateMessage(locale, key) {
  // eslint-disable-next-line import/namespace
  if (translations[locale]['entity-validation-errors'][key]) {
    // eslint-disable-next-line import/namespace
    return translations[locale]['entity-validation-errors'][key];
  }
  return key;
}

function _formatUndefinedAttribute({ message, locale }) {
  return {
    status: '422',
    title: 'Invalid data attributes',
    detail: translateMessage(locale, message),
  };
}

function _formatRelationship({ attribute, message, locale }) {
  const relationship = attribute.replace('Id', '');
  return {
    status: '422',
    source: {
      pointer: `/data/relationships/${_.kebabCase(relationship)}`,
    },
    title: `Invalid relationship "${relationship}"`,
    detail: translateMessage(locale, message),
  };
}

function _formatAttribute({ attribute, message, locale }) {
  return {
    status: '422',
    source: {
      pointer: `/data/attributes/${_.kebabCase(attribute)}`,
    },
    title: `Invalid data attribute "${attribute}"`,
    detail: translateMessage(locale, message),
  };
}

function _formatInvalidAttribute(locale, { attribute, message }) {
  if (!attribute) {
    return _formatUndefinedAttribute({ message, locale });
  }
  if (attribute.endsWith('Id') && !NOT_VALID_RELATIONSHIPS.includes(attribute)) {
    return _formatRelationship({ attribute, message, locale });
  }
  return _formatAttribute({ attribute, message, locale });
}
function _mapToHttpError(error) {
  if (error instanceof DomainErrors.NotFoundError) {
    return new HttpErrors.NotFoundError(error.message);
  }
  if (error instanceof DomainErrors.ForbiddenAccess) {
    return new HttpErrors.ForbiddenError(error.message);
  }
  if (error instanceof DomainErrors.CsvImportError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.UserNotAuthorizedToAccessEntityError) {
    return new HttpErrors.ForbiddenError('Utilisateur non autorisé à accéder à la ressource');
  }
  if (error instanceof DomainErrors.AssessmentEndedError) {
    return new HttpErrors.BaseHttpError(error.message);
  }

  if (error instanceof DomainErrors.LocaleFormatError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.LocaleNotSupportedError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }

  if (error instanceof MissingOrInvalidCredentialsError) {
    return new HttpErrors.UnauthorizedError("L'adresse e-mail et/ou le mot de passe saisis sont incorrects.");
  }
  if (error instanceof PasswordNotMatching) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof UserShouldChangePasswordError) {
    return new HttpErrors.PasswordShouldChangeError(error.message, error.meta);
  }
}

function handle(request, h, error) {
  if (error instanceof EntityValidationError) {
    const locale = extractLocaleFromRequest(request).split('-')[0];

    const jsonApiError = new JSONAPIError(
      error.invalidAttributes?.map(_formatInvalidAttribute.bind(_formatInvalidAttribute, locale)),
    );
    return h.response(jsonApiError).code(422);
  }

  const httpError = _mapToHttpError(error);

  return h.response(errorSerializer.serialize(httpError)).code(httpError.status);
}

export { handle, _mapToHttpError };
