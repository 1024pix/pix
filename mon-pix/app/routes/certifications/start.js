import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  actions: {
    error(error) {
      if (error.errors[0].status === '403') {
        return this.render('certifications.start-error');
      } else {
        this.transitionTo('index');
      }
    },

    submit(certificationCourse) {
      const store = this.store;
      return store.query('assessment', { filter: { type: certificationCourse.get('type'), courseId: certificationCourse.id, resumable: true } })
        .then((assessments) => {
          const assessment = assessments.get('firstObject');
          return this.replaceWith('assessments.resume', assessment.get('id'));
        });
    }
  }
});
