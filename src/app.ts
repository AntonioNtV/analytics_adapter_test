import express from 'express';
import dotenv from 'dotenv';

import routes from './routes/index.routes';

dotenv.config();

class App {
    public express: express.Application;

    constructor() {
        this.express = express();
        this.middlewares();
        this.initialization();
    }

    private middlewares(): void {
        this.express.use(express.json());
    }

    private initialization(): void {
        this.routes();
    }

    private routes(): void {
        this.express.use(routes);
    }
}

const app = new App();
const application = app.express;

export default application;
