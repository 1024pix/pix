import * as poleEmploiNotifier from '../../../../../lib/infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import { PoleEmploiPayload } from '../../../../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as httpErrorsHelper from '../../../../../lib/infrastructure/http/errors-helper.js';
import { httpAgent } from '../../../../../lib/infrastructure/http/http-agent.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as poleEmploiSendingRepository from '../../../../../lib/infrastructure/repositories/pole-emploi-sending-repository.js';
import * as targetProfileRepository from '../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import * as authenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { PoleEmploiSending } from '../../../../shared/domain/models/index.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { ParticipationStartedJob } from '../../domain/models/ParticipationStartedJob.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';

export class ParticipationStartedJobController extends JobController {
  constructor() {
    super(ParticipationStartedJob.name);
  }

  get legacyName() {
    return 'PoleEmploiParticipationStartedJob';
  }

  async handle({
    data,
    dependencies = {
      authenticationMethodRepository,
      campaignRepository,
      campaignParticipationRepository,
      organizationRepository,
      poleEmploiSendingRepository,
      targetProfileRepository,
      userRepository,
      poleEmploiNotifier,
      httpAgent,
      httpErrorsHelper,
      logger,
    },
  }) {
    const { campaignParticipationId } = data;

    const participation = await dependencies.campaignParticipationRepository.get(campaignParticipationId);
    const campaign = await dependencies.campaignRepository.get(participation.campaignId);
    const organization = await dependencies.organizationRepository.get(campaign.organizationId);

    if (campaign.isAssessment() && organization.isPoleEmploi) {
      const user = await dependencies.userRepository.get(participation.userId);
      const targetProfile = await dependencies.targetProfileRepository.get(campaign.targetProfileId);

      const payload = PoleEmploiPayload.buildForParticipationStarted({
        user,
        campaign,
        targetProfile,
        participation,
      });

      const response = await dependencies.poleEmploiNotifier.notify(user.id, payload, {
        authenticationMethodRepository: dependencies.authenticationMethodRepository,
        httpAgent: dependencies.httpAgent,
        httpErrorsHelper: dependencies.httpErrorsHelper,
        logger: dependencies.logger,
      });

      const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
        campaignParticipationId,
        payload: payload.toString(),
        isSuccessful: response.isSuccessful,
        responseCode: response.code,
      });

      await dependencies.poleEmploiSendingRepository.create({ poleEmploiSending });
    }
  }
}
