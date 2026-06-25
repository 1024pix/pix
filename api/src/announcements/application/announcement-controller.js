import { usecases } from '../domain/usecases/index.js';
import { announcementSerializer } from '../infrastructure/serializers/jsonapi/announcement-serializer.js';

const get = async (request, h, dependencies = { announcementSerializer }) => {
  const { name } = request.params;
  const announcement = await usecases.getAnnouncement({ name });
  return dependencies.announcementSerializer.serialize(announcement);
};

const update = async (request, h, dependencies = { announcementSerializer }) => {
  const { name } = request.params;
  const content = request.payload?.data?.attributes?.content ?? null;
  const announcement = await usecases.updateAnnouncement({ name, content });
  return dependencies.announcementSerializer.serialize(announcement);
};

export const announcementController = {
  get,
  update,
};
