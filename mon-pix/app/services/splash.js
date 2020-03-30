import classic from 'ember-classic-decorator';
import Service from '@ember/service';

@classic
export default class SplashService extends Service {
  hide() {
    const splash = document.getElementById('app-splash');
    if (splash) {
      splash.parentNode.removeChild(splash);
    }
  }
}
