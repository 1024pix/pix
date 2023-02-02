module.exports = injectDependencies(
  {
    planner: require('./handlers/planner'),
    createAndUpload: require('./handlers/create-and-upload'),
    sendEmail: require('./handlers/send-email'),
  },
  dependencies
);
