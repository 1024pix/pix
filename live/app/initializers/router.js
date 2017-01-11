
// See http://stackoverflow.com/questions/18302463/get-current-route-name-in-ember
export function initialize(application) {
  application.inject('route', 'router', 'router:main');
  application.inject('component', 'router', 'router:main');
}

export default {
  name: 'router',
  initialize
};
