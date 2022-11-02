const trainingSerializer = require('../../infrastructure/serializers/jsonapi/training-serializer');
const usecases = require('../../domain/usecases');

module.exports = {
  async update(request) {
    const { trainingId } = request.params;
    const training = await trainingSerializer.deserialize(request.payload);
    const updatedTraining = await usecases.updateTraining({ training: { ...training, id: trainingId } });
    return trainingSerializer.serialize(updatedTraining);
  },
};
