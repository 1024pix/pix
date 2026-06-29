import {
  ConflictError,
  ForbiddenError,
  PreconditionFailedError,
  UnprocessableEntityError,
} from '../../../shared/application/errors/http-errors.js';
import {
  CampaignBelongsToCombinedCourseError,
  CampaignCodeFormatError,
  CampaignParticipationDoesNotBelongToUser,
  CampaignUniqueCodeError,
  DeletedCampaignError,
  IsForAbsoluteNoviceUpdateError,
  MultipleSendingsUpdateError,
  OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError,
  OrganizationNotAuthorizedToCreateCampaignError,
  SwapCampaignMismatchOrganizationError,
  UnknownCampaignId,
  UserNotAuthorizedToCreateCampaignError,
} from '../../campaign/domain/errors.js';

const campaignDomainErrorMappingConfiguration = [
  {
    name: UnknownCampaignId.name,
    httpErrorFn: (error) => {
      return new UnprocessableEntityError(error.message, error.code, error.meta);
    },
  },
  {
    name: SwapCampaignMismatchOrganizationError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: IsForAbsoluteNoviceUpdateError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: MultipleSendingsUpdateError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: CampaignUniqueCodeError.name,
    httpErrorFn: (error) => new ConflictError(error.message, error.code, error.meta),
  },
  {
    name: CampaignCodeFormatError.name,
    httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: CampaignParticipationDoesNotBelongToUser.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code, error.meta),
  },
  {
    name: UserNotAuthorizedToCreateCampaignError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message),
  },
  {
    name: OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message),
  },
  {
    name: OrganizationNotAuthorizedToCreateCampaignError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message),
  },
  {
    name: CampaignBelongsToCombinedCourseError.name,
    httpErrorFn: (error) => new ForbiddenError(error.message, error.code),
  },
  {
    name: DeletedCampaignError.name,
    httpErrorFn: (error) => new PreconditionFailedError(error.message, error.code, error.meta),
  },
];

export { campaignDomainErrorMappingConfiguration };
