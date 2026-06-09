import { usecases } from '../domain/usecases/index.js';
import * as announcementSerializer from '../infrastructure/serializers/jsonapi/announcement-serializer.js';

const get = async (request) => {
  const { name } = request.params;
  const announcement = await usecases.getAnnouncement({ name });
  return announcementSerializer.serialize(announcement);
};

const update = async (request) => {
  const { name } = request.params;
  const content = request.payload?.data?.attributes?.content ?? null;
  const announcement = await usecases.updateAnnouncement({ name, content });
  return announcementSerializer.serialize(announcement);
};

export const announcementController = {
  get,
  update,
};
