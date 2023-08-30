import express from 'express';
import { RoutesController } from '../controllers/routesController';

const router = express.Router();

router.get("/", RoutesController.getRoutes);
router.get("/find", RoutesController.getRoutesByDepartureAndArrival);

export default router;