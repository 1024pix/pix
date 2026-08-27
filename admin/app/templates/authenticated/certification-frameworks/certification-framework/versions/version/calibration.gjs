import CertificationVersionCalibrationReport from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-calibration-report';

<template>
  <CertificationVersionCalibrationReport
    @draftVersion={{@model.draftVersion}}
    @calibrationReport={{@model.calibrationReport}}
  />
</template>
