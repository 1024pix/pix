import New from 'pix-admin/components/autonomous-courses/new/index';
<template>
  <New
    @autonomousCourse={{@controller.model.autonomousCourse}}
    @targetProfiles={{@controller.model.targetProfiles}}
    @onSubmit={{@controller.createAutonomousCourse}}
    @onCancel={{@controller.goBackToAutonomousCoursesList}}
  />
</template>
