import express from 'express';
import { SigningController } from '../controllers/signingController';

const router = express.Router();

router.get("/:address/:id", SigningController.signRoute);

export default router;