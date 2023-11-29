const getAutonomousCourseTargetProfiles = async function ({ autonomousCourseTargetProfileRepository }) {
  return await autonomousCourseTargetProfileRepository.get();
};

export { getAutonomousCourseTargetProfiles };
