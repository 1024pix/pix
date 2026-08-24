import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = (announcement) =>
  new Serializer('announcements', {
    attributes: ['content'],
  }).serialize(announcement);

export const announcementSerializer = { serialize };
