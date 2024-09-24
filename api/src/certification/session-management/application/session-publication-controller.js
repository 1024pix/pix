import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as sessionManagementSerializer from '../infrastructure/serializers/session-serializer.js';

const publish = async function (request, h, dependencies = { sessionManagementSerializer }) {
  const sessionId = request.params.id;
  const i18n = request.i18n;

  const session = await usecases.publishSession({ sessionId, i18n });

  return dependencies.sessionManagementSerializer.serialize({ session });
};

export const sessionPublicationController = {
  publish,
};
