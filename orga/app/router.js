import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import { scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,

  metrics: service(),

  didTransition() {
    this._super(...arguments);
    this._trackPage();
  },

  _trackPage() {
    scheduleOnce('afterRender', this, () => {
      const page = this.get('url');
      const title = this.getWithDefault('currentRouteName', 'unknown');
      this.get('metrics').trackPage({ page, title });
    });
  }
});

Router.map(function() {
  this.route('login', { path: 'connexion' });

  this.route('authenticated', { path: '' }, function() {
    this.route('terms-of-service', { path: '/cgu'});
    this.route('campaigns', { path: '/campagnes' }, function() {
      this.route('new', { path: '/creation' });
      this.route('list', { path: '/liste' });
      this.route('update', { path: '/:campaign_id/modification' });
      this.route('details', { path: '/:campaign_id' }, function() {
        this.route('parameters', { path: '/' });
        this.route('participants', { path: '/participants' });
      });
      this.route('participant-details', { path: '/:campaign_id/participant/:campaign_participation_id' });

    });
  });

  this.route('logout');

  if (config.environment !== 'production') {
    this.route('style-guide', { path: 'guide-de-style' });
  }

  this.route('not-found', { path: '/*path' });
});

export default Router;
