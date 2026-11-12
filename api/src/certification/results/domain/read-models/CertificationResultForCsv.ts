import { JuryComment, JuryCommentContexts } from '../../../shared/domain/models/JuryComment.js';
import { CERTIFICATION_RESULT_STATUSES } from '../constants.ts';

type props = {
  certificationId: number;
  firstName: string;
  lastName: string;
  birthdate: string;
  birthplace: string;
  externalId: string | null;
  framework: string;
  status: (typeof CERTIFICATION_RESULT_STATUSES)[keyof typeof CERTIFICATION_RESULT_STATUSES];
  reachedMeshIndex: number | null;
  pixScore: number | null;
  competenceMarks: CompetenceMark[];
  hasAcquiredClea: boolean | null;
  commentForOrganization: string | null;
  commentByAutoJury: AutoJuryCommentKey | null;
  sessionId: number;
  certificationCenter: string;
  startedAt: Date;
};

type CompetenceMark = {
  competenceCode: string;
  level: number;
};

export class CertificationResultForCsv {
  readonly certificationId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly birthdate: string;
  readonly birthplace: string;
  readonly externalId: string | null;
  readonly framework: string;
  readonly status: (typeof CERTIFICATION_RESULT_STATUSES)[keyof typeof CERTIFICATION_RESULT_STATUSES];
  readonly reachedMeshIndex: number | null;
  readonly pixScore: number | null;
  readonly competenceMarks: CompetenceMark[];
  readonly hasAcquiredClea: boolean | null;
  readonly #commentForOrganization: string | null;
  readonly #commentByAutoJury: AutoJuryCommentKey | null;
  readonly sessionId: number;
  readonly certificationCenter: string;
  readonly startedAt: Date;

  constructor(props: props) {
    this.certificationId = props.certificationId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.birthdate = props.birthdate;
    this.birthplace = props.birthplace;
    this.externalId = props.externalId;
    this.framework = props.framework;
    this.status = props.status;
    this.reachedMeshIndex = props.reachedMeshIndex;
    this.pixScore = props.pixScore;
    this.competenceMarks = props.competenceMarks;
    this.hasAcquiredClea = props.hasAcquiredClea;
    this.#commentForOrganization = props.commentForOrganization;
    this.#commentByAutoJury = props.commentByAutoJury;
    this.sessionId = props.sessionId;
    this.certificationCenter = props.certificationCenter;
    this.startedAt = props.startedAt;
  }

  getCommentForOrganization(translate: (key: string) => string): string | null {
    const juryComment = new JuryComment({
      fallbackComment: this.#commentForOrganization,
      context: JuryCommentContexts.ORGANIZATION,
      commentByAutoJury: this.#commentByAutoJury,
    });
    return juryComment.getComment(translate) ?? null;
  }
}
