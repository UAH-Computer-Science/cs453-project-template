import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/authentication';
import { ProjectService } from '../services/projectService';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await ProjectService.getAllProjects();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestedID = Number(req.params.id);
        
        const result = await ProjectService.getProjectByID(requestedID);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const name = req.body?.name?.trim();
        const description = req.body?.description?.trim();
        const ownerID = req.user!.id;

        const result = await ProjectService.createProject(name, description, ownerID);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;