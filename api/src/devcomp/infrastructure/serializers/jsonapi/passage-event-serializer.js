import jsonapiSerializer from 'jsonapi-serializer';

const { Deserializer } = jsonapiSerializer;

const deserialize = async function (payload) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const passageEventsCollection = await deserializer.deserialize(payload);
  return passageEventsCollection.passageEvents.map((passageEvent) => {
    return {
      ...passageEvent,
      occurredAt: new Date(passageEvent.occurredAt),
    };
  });
};

export { deserialize };
