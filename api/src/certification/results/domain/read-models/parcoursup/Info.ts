type InfoProps = {
  sentAt: Date;
  lastUpdatedAtCurrentSchoolYear: Date | null;
  lastUpdatedAtVerificationCode: Date | null;
};

export class Info {
  readonly sentAt: Date;
  readonly lastUpdatedAtCurrentSchoolYear: Date | null;
  readonly lastUpdatedAtVerificationCode: Date | null;

  constructor({ sentAt, lastUpdatedAtCurrentSchoolYear, lastUpdatedAtVerificationCode }: InfoProps) {
    this.sentAt = sentAt;
    this.lastUpdatedAtCurrentSchoolYear = lastUpdatedAtCurrentSchoolYear;
    this.lastUpdatedAtVerificationCode = lastUpdatedAtVerificationCode;
  }
}
