import { Request, Response } from 'express';

import { RoutesRepository } from '../database/routesRepository';

export class RoutesController {
    static getRoutes(req: Request, res: Response) {
        try {
            const routes = RoutesRepository.findAll();
            return res.status(200).send(routes);
        } catch (err) {
            console.log(err);
            return res.sendStatus(500);
        }
    }

    static getRoutesByDepartureAndArrival(req: Request, res: Response) {
        try {
            const { departure, arrival } = req.params;
            const routes = RoutesRepository.findAllByDepartureAndArrival(departure, arrival);
            return res.status(200).send(routes);
        } catch (err) {
            console.log(err);
            return res.sendStatus(500);
        }
    }
};