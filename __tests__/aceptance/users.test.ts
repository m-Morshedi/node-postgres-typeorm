import { AppDataSource } from '../../src/data-source';

import app from '../../src/app';
import { port } from '../../src/config';
import * as request from 'supertest';

let connection, server;
const testUser = {
  firstName: 'test',
  lastName: 'test',
  age: 19,
};

beforeEach(async () => {
  connection = await AppDataSource.initialize();
  await connection.synchronize(true);
  server = app.listen(port);
});

afterEach(() => {
  connection.close();
  server.close();
});

it('should be no users initially', async () => {
  const response = await request(app).get('/users');
  expect(response.statusCode).toBe(200);
  expect(response.body.length).toBe(0);
});

it('should create a user', async () => {
  const response = await request(app).post('/users').send(testUser);
  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual({ ...testUser, id: 1 });
});

it('should not create a user if no firstName is given', async () => {
  const response = await request(app)
    .post('/users')
    .send({ lastName: 'test', age: 19 });
  expect(response.statusCode).toBe(422);
  expect(response.body.errors).not.toBeNull();
  expect(response.body.errors.length).toBe(1);
  expect(response.body.errors[0]).toEqual({
    msg: 'firstName must be a string',
    // param: 'firstName',
    location: 'body',
    path: 'firstName',
    type: 'field',
  });
});

it('should not create a user if age is less than 16', async () => {
  const response = await request(app)
    .post('/users')
    .send({ firstName: 'test', lastName: 'test', age: -1 });
  expect(response.statusCode).toBe(422);
  expect(response.body.errors).not.toBeNull();
  expect(response.body.errors.length).toBe(1);
  expect(response.body.errors[0]).toEqual({
    msg: 'age must be an integer and greater than 16',
    path: 'age',
    value: -1,
    type: 'field',
    location: 'body',
  });
});
