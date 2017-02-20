import Ember from 'ember';

const CourseItem = Ember.Component.extend({

  course: null,

  imageUrl: Ember.computed('course', function () {
    const imageUrl = this.get('course.imageUrl');
    return imageUrl ? imageUrl : '/assets/images/course-default-image.png';
  }),

  actions: {
    startCourse(course) {
      this.sendAction('startCourse', course);
    }
  }

});

export default CourseItem;
