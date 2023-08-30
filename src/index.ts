import express from 'express';

import RoutesRoutes from './routes/routes';
import SigningRoutes from './routes/signing';

import { RoutesRepository } from './database/routesRepository';

//@ts-ignore
BigInt.prototype.toJSON = function () { return this.toString() }

const PORT = 3001;

const app = express();

app.use(express.json());

RoutesRepository.setup(true);


app.use("/api/routes", RoutesRoutes);
app.use("/api/sign", SigningRoutes);


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));