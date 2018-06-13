module.exports = ({ preloader, logger }) => {

  logger.info('Start');

  return Promise.all([
    preloader.loadAreas(),
    preloader.loadChallenges(),
    preloader.loadCompetences(),
    preloader.loadCourses(),
    preloader.loadSkills()
  ])
    .then(() => logger.info('Done'));
};
