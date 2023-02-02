import planner from './handlers/planner';
import createAndUpload from './handlers/create-and-upload';
import sendEmail from './handlers/send-email';

export default injectDependencies(
  {
    planner,
    createAndUpload,
    sendEmail,
  },
  dependencies
);
