import * as events from '../../../../lib/domain/events/index.js';
import { usecases as sessionUsecases } from '../../session/domain/usecases/index.js';
import * as certificationReportSerializer from '../../shared/infrastructure/serializers/jsonapi/certification-report-serializer.js';
import * as sessionSerializer from '../infrastructure/serializers/jsonapi/session-serializer.js';

async function createSession(request, _h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);

  const newSession = await sessionUsecases.createSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: newSession });
}

const update = async function (request, h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);
  session.id = request.params.id;

  const updatedSession = await sessionUsecases.updateSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: updatedSession });
};

const remove = async function (request, h) {
  const sessionId = request.params.id;

  await sessionUsecases.deleteSession({ sessionId });

  return h.response().code(204);
};

const finalize = async function (request, h, dependencies = { certificationReportSerializer, events }) {
  const sessionId = request.params.id;
  const examinerGlobalComment = request.payload.data.attributes['examiner-global-comment'];
  const hasIncident = request.payload.data.attributes['has-incident'];
  const hasJoiningIssue = request.payload.data.attributes['has-joining-issue'];
  const certificationReports = await Promise.all(
    (request.payload.data.included || [])
      .filter((data) => data.type === 'certification-reports')
      .map((data) => dependencies.certificationReportSerializer.deserialize({ data })),
  );

  const event = await sessionUsecases.finalizeSession({
    sessionId,
    examinerGlobalComment,
    hasIncident,
    hasJoiningIssue,
    certificationReports,
  });
  await dependencies.events.eventDispatcher.dispatch(event);
  return h.response().code(200);
};

const sessionController = {
  createSession,
  update,
  remove,
  finalize,
};
export { sessionController };
