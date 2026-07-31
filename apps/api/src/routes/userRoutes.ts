import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/authentication';
import { UserService } from '../services/userService';

import { requireRole } from "../middleware/authorize";

const router = Router();

router.get('/', authenticateToken, requireRole("admin"), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await UserService.getAllUsers();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

// router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const requestedID = Number(req.params.id);

//         const result = await UserService.getUserByID(requestedID);
//         res.status(200).json(result);
//     } catch (error) {
//         next(error);
//     }
// });

export default router;