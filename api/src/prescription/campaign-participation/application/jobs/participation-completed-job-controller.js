import * as poleEmploiNotifier from '../../../../../lib/infrastructure/externals/pole-emploi/pole-emploi-notifier.js';
import { PoleEmploiPayload } from '../../../../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as httpErrorsHelper from '../../../../../lib/infrastructure/http/errors-helper.js';
import { httpAgent } from '../../../../../lib/infrastructure/http/http-agent.js';
import * as campaignParticipationRepository from '../../../../../lib/infrastructure/repositories/campaign-participation-repository.js';
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as poleEmploiSendingRepository from '../../../../../lib/infrastructure/repositories/pole-emploi-sending-repository.js';
import * as targetProfileRepository from '../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import { logger } from '../../../../../src/shared/infrastructure/utils/logger.js';
import { assessmentRepository } from '../../../../certification/session-management/infrastructure/repositories/index.js';
import * as authenticationMethodRepository from '../../../../identity-access-management/infrastructure/repositories/authentication-method.repository.js';
import * as userRepository from '../../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { JobController } from '../../../../shared/application/jobs/job-controller.js';
import { PoleEmploiSending } from '../../../../shared/domain/models/index.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { ParticipationCompletedJob } from '../../domain/models/ParticipationCompletedJob.js';

export class ParticipationCompletedJobController extends JobController {
  constructor() {
    super(ParticipationCompletedJob.name);
  }

  get legacyName() {
    return 'PoleEmploiParticipationCompletedJob';
  }

  async handle({
    data,
    dependencies = {
      authenticationMethodRepository,
      assessmentRepository,
      campaignRepository,
      campaignParticipationRepository,
      organizationRepository,
      poleEmploiSendingRepository,
      targetProfileRepository,
      userRepository,
      poleEmploiNotifier,
      logger,
      httpAgent,
      httpErrorsHelper,
    },
  }) {
    const { campaignParticipationId } = data;

    if (!campaignParticipationId) return;

    const participation = await dependencies.campaignParticipationRepository.get(campaignParticipationId);
    const campaign = await dependencies.campaignRepository.get(participation.campaignId);
    const organization = await dependencies.organizationRepository.get(campaign.organizationId);

    if (campaign.isAssessment() && organization.isPoleEmploi) {
      const user = await dependencies.userRepository.get(participation.userId);
      const targetProfile = await dependencies.targetProfileRepository.get(campaign.targetProfileId);
      const assessment = await dependencies.assessmentRepository.get(participation.lastAssessment.id);

      const payload = PoleEmploiPayload.buildForParticipationFinished({
        user,
        campaign,
        targetProfile,
        participation,
        assessment,
      });
      const response = await dependencies.poleEmploiNotifier.notify(user.id, payload, {
        authenticationMethodRepository: dependencies.authenticationMethodRepository,
        httpAgent: dependencies.httpAgent,
        httpErrorsHelper: dependencies.httpErrorsHelper,
        logger: dependencies.logger,
      });

      const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
        campaignParticipationId,
        payload: payload.toString(),
        isSuccessful: response.isSuccessful,
        responseCode: response.code,
      });

      return dependencies.poleEmploiSendingRepository.create({ poleEmploiSending });
    }
  }
}
