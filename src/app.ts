import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { Routes } from './routes';
import * as morgan from 'morgan';
import { validationResult } from 'express-validator';

function handleErr(err: any, req: Request, res: Response, next: Function) {
  res.status(err.statusCode || 500).send({ message: err.message });
}

const app = express();

app.use(morgan('dev'));

app.use(bodyParser.json());

// register express routes from defined application routes
Routes.forEach((route) => {
  (app as any)[route.method](
    route.route,
    ...route.validation,
    async (req: Request, res: Response, next: Function) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() }); // 422 Unprocessable Entity
        }
        const result = await new (route.controller as any)()[route.action](
          req,
          res,
          next
        );
        res.json(result);
      } catch (error) {
        next(error);
      }
    }
  );
});

// middleware
app.use(handleErr);

export default app;
