import { AppDataSource } from './data-source';
import app from './app';

import { port } from './config';

AppDataSource.initialize()
  .then(async () => {
    // start express server
    app.listen(port);
    console.log(`Express server has started on port ${port}`);
  })
  .catch((error) => console.log(error));
