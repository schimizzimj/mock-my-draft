import { Router } from 'express';
import { DraftClassController } from '../controllers/draft-class.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const draftClassController = new DraftClassController();

router.get('/years', draftClassController.getYears);
router.get(
  '/:year/team/:teamId',
  draftClassController.getDraftClassByYearAndTeamId,
);
router.get('/:year', draftClassController.getDraftClassesByYear);
router.post(
  '/',
  authenticate,
  requireAdmin,
  draftClassController.createDraftClass,
);
router.post(
  '/bulk',
  authenticate,
  requireAdmin,
  draftClassController.bulkCreateDraftClasses,
);
router.put(
  '/:year/team/:teamId',
  authenticate,
  requireAdmin,
  draftClassController.updateDraftClass,
);

export default router;
