import CertificationVersionCalibrationReport from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-calibration-report';

<template>
  <CertificationVersionCalibrationReport
    @draftVersion={{@model.draftVersion}}
    @activeVersion={{@model.activeVersion}}
    @calibrationReport={{@model.calibrationReport}}
  />
</template>
