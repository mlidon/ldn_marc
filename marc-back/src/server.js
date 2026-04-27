import app from './app.js';
import { env } from './config/env.js';
import { testDbConnection } from './config/db.js';

async function bootstrap() {
  try {
    await testDbConnection();

    app.listen(env.port, () => {
      console.log(`Servidor escuchando en http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

bootstrap();