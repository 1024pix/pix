module.exports = function(job) {
  const options = job.data;
  return this._provider.sendEmail(options);
};
