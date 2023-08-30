import Database from 'better-sqlite3';
const db = new Database('routes.db');
db.pragma('journal_mode = WAL');

enum TypeOfTransport {
    TRAIN,
    BOAT,
    PLANE
}

class PointOfInterest {
    name: string;
    x: BigInt;
    y: BigInt;
    constructor(name: string, x: BigInt, y: BigInt) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
}


export class RoutesRepository {
    id: string;
    typeOfTransport: TypeOfTransport;
    price: BigInt;
    from: PointOfInterest;
    to: PointOfInterest;
    departureTime: number;
    eta: number;
    classNumber: number;
    custom: string;
    constructor(id: string, typeOfTransport: TypeOfTransport, price: BigInt, from: PointOfInterest, to: PointOfInterest, departureTime: number, eta: number, classNumber: number, custom: string) {
        this.id = id;
        this.typeOfTransport = typeOfTransport;
        this.price = price;
        this.from = from;
        this.to = to;
        this.departureTime = departureTime;
        this.eta = eta;
        this.classNumber = classNumber;
        this.custom = custom;
    }

    static setup(DEBUG = true) {
        db.prepare(
            `CREATE TABLE IF NOT EXISTS "routes" (
                "id"	INTEGER NOT NULL UNIQUE,
                "typeOfTransport"	TEXT NOT NULL,
                "price"	TEXT NOT NULL,
                "from_point" INTEGER NOT NULL,
                "to_point" INTEGER NOT NULL,
                "departureTime" NUMBER NOT NULL,
                "eta" NUMBER NOT NULL,
                "classNumber" NUMBER NOT NULL,
                "custom" TEXT,
                PRIMARY KEY("id"),
                FOREIGN KEY("to_point") REFERENCES "point_of_interest"("id"),
                FOREIGN KEY("from_point") REFERENCES "point_of_interest"("id")
            )`,
        ).run();
        db.prepare(
            `CREATE TABLE IF NOT EXISTS "point_of_interest" (
                "id"	INTEGER,
                "name"	TEXT NOT NULL,
                "x" NUMBER NOT NULL,
                "y" NUMBER NOT NULL,
                PRIMARY KEY("id")
            )`,
        ).run();
        // Setup of the database with the required rows requested by the exam requirements
        // Run the following code only if you want to setup the database for the exam. NOT production code.
        if (!DEBUG) return;

        const routesInsert = db.prepare(
            "INSERT OR IGNORE INTO routes(id, typeOfTransport, price, from_point, to_point, departureTime, eta, classNumber, custom) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        );
        const poiInsert = db.prepare(
            "INSERT OR IGNORE INTO point_of_interest(id, name, x, y) VALUES(?, ?, ?, ?)",
        );
        const defaultPoi = [
            [0, "Torino Porta Nuova", 1, 2],
            [1, "Torino Porta Susa", 2, 3],
            [2, "XVIII Dicembre", 3, 4],
            [3, "Stazione Dante", 4, 5],
            [4, "Stazione Monte Grappa", 5, 6],
            [5, "Torino Porta nuova", 1, 2],
            [6, "Torino Porta susa", 3, 4]
        ];

        const defaultRoutes = [
            [0, "TRAIN", "100000000000000000", 0, 1, 1691438664, 1691439664, 1, ""],
            [1, "TRAIN", "200000000000000000", 1, 2, 1691436664, 1691479664, 1, ""],
            [2, "TRAIN", "300000000000000000", 2, 3, 1691437664, 1691489664, 1, ""],
            [3, "TRAIN", "400000000000000000", 3, 4, 1691448664, 1691499664, 1, ""],
            [4, "TRAIN", "500000000000000000", 4, 0, 1691439664, 1691639664, 1, ""],
            [5, "TRAIN", "1000000000000000000", 5, 6, 1691439664, 1691639664, 1, ""],
        ];

        for (const poi of defaultPoi) {
            poiInsert.run(poi[0], poi[1], poi[2], poi[3]);
        }

        for (const route of defaultRoutes) {
            routesInsert.run(route[0], route[1], route[2], route[3], route[4], route[5], route[6], route[7], route[8]);
        }
    }

    static findRoute(id: string) {
        const rawRoute: any = db
            .prepare(
                `SELECT 
                    r.id AS id,
                    typeOfTransport,
                    price,
                    departureTime,
                    eta,
                    classNumber,
                    custom,
                    f.name AS fname,
                    f.x AS fx,
                    f.y AS fy,
                    t.name AS tname,
                    t.x AS tx,
                    t.y AS ty
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point
                WHERE r.id = ?`
            )
            .get(id);
        if (!rawRoute) {
            return undefined;
        }
        return new this(
            rawRoute.id,
            TypeOfTransport[rawRoute.typeOfTransport as keyof typeof TypeOfTransport],
            BigInt(rawRoute.price),
            new PointOfInterest(rawRoute.fname, BigInt(rawRoute.fx), BigInt(rawRoute.fy)),
            new PointOfInterest(rawRoute.tname, BigInt(rawRoute.tx), BigInt(rawRoute.ty)),
            rawRoute.departureTime,
            rawRoute.eta,
            rawRoute.classNumber,
            rawRoute.custom
        );
    }

    static findAll() {
        const rawRoutes = db
            .prepare(
                `SELECT
                    r.id AS id,
                    typeOfTransport,
                    price,
                    departureTime,
                    eta,
                    classNumber,
                    custom,
                    f.name AS fname,
                    f.x AS fx,
                    f.y AS fy,
                    t.name AS tname,
                    t.x AS tx,
                    t.y AS ty
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point`
            )
            .all();

        const routes = [];
        for (const route of rawRoutes as any[]) {
            routes.push(
                new this(
                    route.id,
                    TypeOfTransport[route.typeOfTransport as keyof typeof TypeOfTransport],
                    BigInt(route.price),
                    new PointOfInterest(route.fname, BigInt(route.fx), BigInt(route.fy)),
                    new PointOfInterest(route.tname, BigInt(route.tx), BigInt(route.ty)),
                    route.departureTime,
                    route.eta,
                    route.classNumber,
                    route.custom
                ),
            );
        }
        return routes;
    }

    static findAllByDepartureAndArrival(departure: string, arrival: string) {
        const rawRoutes = db
            .prepare(
                `SELECT
                    r.id AS id,
                    typeOfTransport,
                    price,
                    departureTime,
                    eta,
                    classNumber,
                    custom,
                    f.name AS fname,
                    f.x AS fx,
                    f.y AS fy,
                    t.name AS tname,
                    t.x AS tx,
                    t.y AS ty
                FROM routes as r
                INNER JOIN point_of_interest AS f ON f.id = r.from_point
                INNER JOIN point_of_interest AS t ON t.id = r.to_point
                WHERE fname LIKE ? AND tname LIKE ?`
            )
            .all(departure, arrival);

        const routes = [];
        for (const route of rawRoutes as any[]) {
            routes.push(
                new this(
                    route.id,
                    TypeOfTransport[route.typeOfTransport as keyof typeof TypeOfTransport],
                    BigInt(route.price),
                    new PointOfInterest(route.fname, BigInt(route.fx), BigInt(route.fy)),
                    new PointOfInterest(route.tname, BigInt(route.tx), BigInt(route.ty)),
                    route.departureTime,
                    route.eta,
                    route.classNumber,
                    route.custom
                ),
            );
        }
        return routes;
    }
}