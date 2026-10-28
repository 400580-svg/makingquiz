import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quizzesRouter from "./quizzes";
import teacherSignupRouter from "./teacher-signup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(teacherSignupRouter);
router.use(quizzesRouter);

export default router;
