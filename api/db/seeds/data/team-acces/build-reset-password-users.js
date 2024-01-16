import { DEFAULT_PASSWORD } from '../../../constants.js';

function _buildUserWithShouldChangePassword(databaseBuilder) {
  databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Kaa',
    lastName: 'Reboot',
    email: 'change-password@example.net',
    username: 'kaa.reboot',
    rawPassword: DEFAULT_PASSWORD,
    shouldChangePassword: true,
    cgu: false,
  });
}

export function buildResetPasswordUsers(databaseBuilder) {
  _buildUserWithShouldChangePassword(databaseBuilder);
}
