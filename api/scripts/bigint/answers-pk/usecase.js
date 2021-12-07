const { isScheduled } = require('./settings-repository');
const { copyIntIdToBigintId } = require('./answers-repository');

const migrate = async () => {
  if (!(await isScheduled())) {
    return;
  }

  await copyIntIdToBigintId({ startAt: 1, endAt: 2 });
};

module.exports = {
  migrate,
};
