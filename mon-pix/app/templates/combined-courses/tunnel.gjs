//import TunnelSteps from 'mon-pix/components/combined-course/tunnel/tunnel-steps';
import CombinedCoursePresentation from 'mon-pix/components/routes/combined-courses/presentation'

<template>
  <CombinedCoursePresentation
    @combinedCourse={{@model}}
    @isTunnel="true"
  />
</template>
