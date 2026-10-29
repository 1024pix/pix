type SessionProps = {
  id: number;
  certificationIds: Array<number>;
};

export class Session {
  readonly id: number;
  readonly certificationIds: Array<number>;

  constructor({ id, certificationIds }: SessionProps) {
    this.id = id;
    this.certificationIds = certificationIds;
  }
}
