const userRepository = require('../../infrastructure/repositories/user-repository');
const competenceRepository = require('../../infrastructure/repositories/competence-repository');
const areaRepository = require('../../infrastructure/repositories/area-repository');

const Profile = require('../../domain/models/data/profile');

const profileService = {
  getByUserId(user_id) {
    const user = userRepository.findUserById(user_id);
    const competences = competenceRepository.list();
    const areas = areaRepository.list();

    return Promise.all([user, competences, areas])
      .then(([user, competences, areas]) => {
        return new Profile(user, competences, areas);
      });
  }
};
module.exports = profileService;
