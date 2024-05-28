import { usecases } from '../domain/usecases/index.js';
import * as prescriberSerializer from '../infrastructure/serializers/jsonapi/prescriber-serializer.js';

const get = async function (request, h, dependencies = { prescriberSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const prescriber = await usecases
    .getPrescriber({ userId: authenticatedUserId })
    .then((prescriber) => dependencies.prescriberSerializer.serialize(prescriber));
  return prescriber;
};

export const prescriberInformationsController = { get };
