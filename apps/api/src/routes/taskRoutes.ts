import { Router, Request, Response, NextFunction } from 'express';
import { TaskService } from "../services/taskService";
import { BadRequestError, ForbiddenError, UnauthorizedError } from '../errors';
import { authenticateToken, canModify } from '../middleware/authentication';
import { ProjectService } from '../services/projectService';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await TaskService.getAllTasks();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestedID = Number(req.params.id);

        const result = await TaskService.getTaskByID(requestedID);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const title = req.body?.title?.trim();
        const description = req.body?.description?.trim();
        const status = req.body?.status?.trim();
        const projectID = req.body?.project_id?.trim();
        const assignedTo = req.body?.assigned_to?.trim();

        const result = await TaskService.createTask(title, description, status, projectID, assignedTo);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestedID = Number(req.params.id);

        // authorization
        const task = await TaskService.getTaskByID(requestedID);
        const project = await ProjectService.getProjectByID(task.projectID);
        const bool = await canModify(req.user!.id, project.ownerID);
        if(!bool) {
            throw new ForbiddenError("You do not have permission to update this task.");
        }
        
        if ("title" in req.body) {
            const title = req.body?.title?.trim();
            if (!title) {
                throw new BadRequestError("A title is required.");
            }
            const result = await TaskService.updateTaskTitle(title, requestedID);
            res.status(200).json(result);
        }
        else if ("description" in req.body) {
            const description = req.body?.description?.trim();
            if (!description) {
                throw new BadRequestError("A description is required.");
            }
            const result = await TaskService.updateTaskDescription(description, requestedID);
            res.status(200).json(result);
        }
        else if ("status" in req.body) {
            const status = req.body?.status?.trim();
            if (!status) {
                throw new BadRequestError("A status is required.");
            }
            const result = await TaskService.updateTaskStatus(status, requestedID);
            res.status(200).json(result);
        }
        else if ("project_id" in req.body) {
            const projectID = req.body?.project_id?.trim();
            if (!projectID) {
                throw new BadRequestError("A project ID is required.");
            }
            const result = await TaskService.updateTaskProjectID(projectID, requestedID);
            res.status(200).json(result);
        }
        else if ("assigned_to" in req.body) {
            const assignedTo = req.body?.assigned_to?.trim();
            if (!assignedTo) {
                throw new BadRequestError("A user ID assigned to this task is required.");
            }
            const result = await TaskService.updateTaskUserID(assignedTo, requestedID);
            res.status(200).json(result);
        }
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const requestedID = Number(req.params.id);

        // authorization
        const task = await TaskService.getTaskByID(requestedID);
        const project = await ProjectService.getProjectByID(task.projectID);
        const bool = await canModify(req.user!.id, project.ownerID);
        if(!bool) {
            throw new ForbiddenError("You do not have permission to delete this task.");
        }

        await TaskService.deleteTask(requestedID);
        res.status(204).json({ status: "Successfully deleted" });
    } catch (error) {
        next(error);
    }
});

export default router;