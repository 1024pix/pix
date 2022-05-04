const usecases = require('../../domain/usecases');
const skillSerializer = require('../../infrastructure/serializers/jsonapi/skill-serializer');

module.exports = {
  async listSkills(request) {
    const tubeId = request.params.id;

    const skills = await usecases.getTubeSkills({ tubeId });

    return skillSerializer.serialize(skills);
  },
};
