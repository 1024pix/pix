import Service from '@ember/service';

export default Service.extend({
  hide() {
    const splash = document.getElementById('app-splash');
    if (splash) {
      splash.parentNode.removeChild(splash);
    }
  }
});
