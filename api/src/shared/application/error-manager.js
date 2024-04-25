import jsonapiSerializer from 'jsonapi-serializer';
import _ from 'lodash';

import { extractLocaleFromRequest } from '../../../lib/infrastructure/utils/request-response-utils.js';
import * as translations from '../../../translations/index.js';
import { AdminMemberError } from '../../authorization/domain/errors.js';
import { CsvWithNoSessionDataError, SessionStartedDeletionError } from '../../certification/session/domain/errors.js';
import { EmptyAnswerError } from '../../evaluation/domain/errors.js';
import { ArchivedCampaignError } from '../../prescription/campaign/domain/errors.js';
import { CampaignParticipationDeletedError } from '../../prescription/campaign-participation/domain/errors.js';
import { AggregateImportError, SiecleXmlImportError } from '../../prescription/learner-management/domain/errors.js';
import { OrganizationCantGetPlacesStatisticsError } from '../../prescription/organization-place/domain/errors.js';
import * as DomainErrors from '../domain/errors.js';
import {
  AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError,
  EntityValidationError,
  OidcError,
  TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization,
  V3PilotNotAuthorizedForCertificationCenterError,
} from '../domain/errors.js';
import * as errorSerializer from '../infrastructure/serializers/jsonapi/error-serializer.js';
import { domainErrorMapper } from './domain-error-mapper.js';
import { HttpErrors } from './http-errors.js';

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
    return new HttpErrors.ForbiddenError(error.message, error.code);
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
  if (error instanceof DomainErrors.CertificationAttestationGenerationError) {
    return new HttpErrors.UnprocessableEntityError(error.message);
  }

  if (error instanceof DomainErrors.InvalidExternalUserTokenError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.InvalidResultRecipientTokenError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }
  if (error instanceof DomainErrors.InvalidTemporaryKeyError) {
    return new HttpErrors.UnauthorizedError(error.message);
  }

  if (error instanceof DomainErrors.LocaleFormatError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.LanguageNotSupportedError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof DomainErrors.LocaleNotSupportedError) {
    return new HttpErrors.BadRequestError(error.message, error.code, error.meta);
  }
  if (error instanceof AdminMemberError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }
  if (error instanceof DomainErrors.NoCertificationAttestationForDivisionError) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SessionStartedDeletionError) {
    return new HttpErrors.ConflictError(error.message);
  }
  if (error instanceof OrganizationCantGetPlacesStatisticsError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof AutonomousCourseRequiresATargetProfileWithSimplifiedAccessError) {
    return new HttpErrors.BadRequestError(error.message);
  }

  if (error instanceof TargetProfileRequiresToBeLinkedToAutonomousCourseOrganization) {
    return new HttpErrors.BadRequestError(error.message);
  }
  if (error instanceof SiecleXmlImportError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }
  if (error instanceof ArchivedCampaignError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof CsvWithNoSessionDataError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code);
  }

  if (error instanceof OidcError) {
    return new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta);
  }

  if (error instanceof DomainErrors.InvalidInputDataError) {
    return new HttpErrors.PreconditionFailedError(error.message, error.code, error.meta);
  }

  if (error instanceof CampaignParticipationDeletedError) {
    return new HttpErrors.PreconditionFailedError(error.message);
  }

  if (error instanceof EmptyAnswerError) {
    return new HttpErrors.BadRequestError(error.message, error.code);
  }

  if (error instanceof V3PilotNotAuthorizedForCertificationCenterError) {
    return new HttpErrors.ForbiddenError(error.message, error.code);
  }

  return new HttpErrors.BaseHttpError(error.message);
}

function handle(request, h, error) {
  if (error instanceof EntityValidationError) {
    const locale = extractLocaleFromRequest(request).split('-')[0];

    const jsonApiError = new JSONAPIError(
      error.invalidAttributes?.map(_formatInvalidAttribute.bind(_formatInvalidAttribute, locale)),
    );
    return h.response(jsonApiError).code(422);
  }

  const httpError = domainErrorMapper.mapToHttpError(error) ?? _mapToHttpError(error);

  if (error instanceof AggregateImportError) {
    httpError.meta.forEach((error) => {
      error.status = httpError.status;
    });
    return h.response(errorSerializer.serialize(httpError.meta)).code(httpError.status);
  }

  return h.response(errorSerializer.serialize(httpError)).code(httpError.status);
}

export { _mapToHttpError, handle };
