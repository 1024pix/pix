import dayjs from 'dayjs';

import { usecases as libUsecases } from '../../../../lib/domain/usecases/index.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { usecases } from '../../domain/usecases/index.js';

const generateUsernamesFile = async function (request, h) {
  const payload = request.payload.data.attributes;
  const organizationId = payload['organization-id'];
  const organizationLearnerIds = payload['organization-learner-ids'];

  const generatedCsvContent = await DomainTransaction.execute(async () => {
    const organizationLearnerUsernames = await usecases.generateUsernames({
      organizationLearnerIds,
      organizationId,
    });
    return libUsecases.generateResetOrganizationLearnersPasswordCsvContent({
      organizationLearnersPasswordResets: organizationLearnerUsernames,
    });
  });

  const dateWithTime = dayjs().locale('fr').format('YYYYMMDD_HHmm');
  const generatedCsvContentFileName = `${dateWithTime}_organization_learner_usernames.csv`;

  return h
    .response(generatedCsvContent)
    .header('content-type', 'text/csv;charset=utf-8')
    .header('content-disposition', `attachment; filename=${generatedCsvContentFileName}`);
};

const scoOrganizationLearnerController = {
  generateUsernamesFile,
};

export { scoOrganizationLearnerController };
