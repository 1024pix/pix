import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = (model) =>
  new Serializer('badge-acquisitions-statistics', {
    id: 'campaignId',
    attributes: ['data'],
    data: {
      attributes: ['badge', 'count', 'percentage'],
    },
    transform(record) {
      record.data = record.data.sort((a, b) => b.percentage - a.percentage);
      return record;
    },
  }).serialize(model);

export const badgeAcquisitionsStatisticsSerializer = { serialize };
