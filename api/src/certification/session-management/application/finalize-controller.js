import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { certificationReportSerializer } from '../../shared/infrastructure/serializers/jsonapi/certification-report-serializer.js';
import { usecases } from '../domain/usecases/index.js';

const finalize = async function (request, h, dependencies = { certificationReportSerializer }) {
  const sessionId = request.params.sessionId;
  const examinerGlobalComment = request.payload.data.attributes['examiner-global-comment'];
  const hasIncident = request.payload.data.attributes['has-incident'];
  const hasJoiningIssue = request.payload.data.attributes['has-joining-issue'];
  const certificationReports = await Promise.all(
    (request.payload.data.included || [])
      .filter((data) => data.type === 'certification-reports')
      .map((data) => dependencies.certificationReportSerializer.deserialize({ data })),
  );

  await DomainTransaction.execute(async () => {
    const session = await usecases.finalizeSession({
      sessionId,
      examinerGlobalComment,
      hasIncident,
      hasJoiningIssue,
      certificationReports,
    });

    await usecases.processAutoJury({ session });

    await usecases.registerPublishableSession({ session });
  });

  return h.response().code(200);
};

const finalizeController = {
  finalize,
};
export { finalizeController };
