import * as requestResponseUtils from '../../../src/shared/infrastructure/utils/request-response-utils.js';
import * as events from '../../domain/events/index.js';
import { usecases } from '../../domain/usecases/index.js';
import * as shareableCertificateSerializer from '../../infrastructure/serializers/jsonapi/shareable-certificate-serializer.js';

const getCertificationByVerificationCode = async function (request, h, dependencies = { requestResponseUtils }) {
  const verificationCode = request.payload.verificationCode;
  const locale = dependencies.requestResponseUtils.extractLocaleFromRequest(request);

  const shareableCertificate = await usecases.getShareableCertificate({ verificationCode, locale });
  return shareableCertificateSerializer.serialize(shareableCertificate);
};

const neutralizeChallenge = async function (request, h, dependencies = { events }) {
  const challengeRecId = request.payload.data.attributes.challengeRecId;
  const certificationCourseId = request.payload.data.attributes.certificationCourseId;
  const juryId = request.auth.credentials.userId;
  const event = await usecases.neutralizeChallenge({
    challengeRecId,
    certificationCourseId,
    juryId,
  });
  await dependencies.events.eventDispatcher.dispatch(event);
  return h.response().code(204);
};

const deneutralizeChallenge = async function (request, h, dependencies = { events }) {
  const challengeRecId = request.payload.data.attributes.challengeRecId;
  const certificationCourseId = request.payload.data.attributes.certificationCourseId;
  const juryId = request.auth.credentials.userId;
  const event = await usecases.deneutralizeChallenge({
    challengeRecId,
    certificationCourseId,
    juryId,
  });
  await dependencies.events.eventDispatcher.dispatch(event);
  return h.response().code(204);
};

const certificationController = {
  getCertificationByVerificationCode,
  neutralizeChallenge,
  deneutralizeChallenge,
};

export { certificationController };
