module.exports = async function finishPixContest({ userId, userRepository }) {

  return await userRepository.updateUserAttributes(userId, { finishedPixContestAt: new Date() });
};
