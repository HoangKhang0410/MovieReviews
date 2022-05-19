import app from './server.js';
import mongodb from 'mongodb';
import dotenv from 'dotenv';
import MovieDAO from './dao/moviesDAO.js';
import ReviewDAO from './dao/reviewsDAO.js';

async function main() {
    dotenv.config();

    const client = new mongodb.MongoClient(process.env.MOVIEREVIEWS_DB_URI);

    const port = process.env.PORT || 8000;

    try {
        await client.connect();
        await MovieDAO.injectDB(client);
        await ReviewDAO.injectDB(client);
        app.listen(port, () => {
            console.log(`Server is listening on port: ${port}`);
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
main().catch(console.error);
