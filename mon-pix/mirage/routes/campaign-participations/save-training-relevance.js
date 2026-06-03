export default function (schema, request) {
  const trainingId = request.params.trainingId;
  const requestBody = JSON.parse(request.requestBody);
  const isRelevant = requestBody.data.attributes['is-relevant'];
  const training = schema.trainings.find(trainingId);
  training.update({ isRelevant });
  return training;
}
