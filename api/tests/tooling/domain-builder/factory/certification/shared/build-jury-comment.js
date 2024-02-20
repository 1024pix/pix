import {
  JuryComment,
  JuryCommentContexts,
} from '../../../../../../src/certification/shared/domain/models/JuryComment.js';

const buildJuryComment = ({ commentByAutoJury, context, fallbackComment } = {}) => {
  return new JuryComment({ commentByAutoJury, context, fallbackComment });
};

buildJuryComment.candidate = ({ commentByAutoJury, fallbackComment } = {}) => {
  return buildJuryComment({ commentByAutoJury, fallbackComment, context: JuryCommentContexts.CANDIDATE });
};

buildJuryComment.organization = ({ commentByAutoJury, fallbackComment } = {}) => {
  return buildJuryComment({ commentByAutoJury, fallbackComment, context: JuryCommentContexts.ORGANIZATION });
};

export { buildJuryComment };
