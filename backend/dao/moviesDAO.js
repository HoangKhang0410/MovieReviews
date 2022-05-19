import e from 'express';
import { ObjectId } from 'mongodb';

let movies;

export default class MoviesDAO {
    static async injectDB(conn) {
        if (movies) {
            return;
        }
        try {
            movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection('movies');
        } catch (error) {
            console.log(`Unable to connect in MovieDAO: ${error}`);
        }
    }
    static async getMovies({ filters = null, page = 0, moviesPerPage = 20 } = {}) {
        let query;
        if (filters) {
            if ('title' in filters) {
                query = { $text: { $search: filters['title'] } };
            } else if ('rated' in filters) {
                query = { rated: { $eq: filters['rated'] } };
            }
        }
        let cursor;
        try {
            cursor = await movies
                .find(query)
                .limit(moviesPerPage)
                .skip(moviesPerPage * page);
            const moviesList = await cursor.toArray();
            const totalNumMovies = await movies.countDocuments(query);
            return { moviesList, totalNumMovies };
        } catch (error) {
            console.log(`Unable to issue command, ${error}`);
            return { moviesList: [], totalNumMovies: 0 };
        }
    }
    static async getMovieById(id) {
        try {
            return await movies
                .aggregate([
                    {
                        $match: { _id: new ObjectId(id) },
                    },
                    {
                        $lookup: {
                            from: 'reviews',
                            localField: '_id',
                            foreignField: 'movieId',
                            as: 'reviews',
                        },
                    },
                ])
                .next();
        } catch (error) {
            console.error(`Something went wrong in getMovieById: ${error}`);
            throw error;
        }
    }
    static async getRatings() {
        let ratings = [];
        try {
            ratings = await movies.distinct('rated');
            return ratings;
        } catch (error) {
            console.error(`Unable to get ratings, ${error}`);
            return ratings;
        }
    }
}
