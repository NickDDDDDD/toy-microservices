import { Router } from "express";
import healthRouter from "./health";

const router = Router();

router.use(healthRouter);
// router.use('/chat', chatRouter); // 将来可添加更多路由

export default router;
