const HOST = 'http://localhost'
const PORT = 4000
const URL = `${HOST}:${PORT}`
const ALGORITHM = 'RS256'

const CONF =
{
    URL: URL,
    HOST: HOST,
    PORT: PORT,
    API_ROUTE: '/graphql',

    // Mongo Database
    DB_URL: 'mongodb://localhost:27017/blog',

    // Graphql server
    GRAPHQL: {
        graphiql: true,
        debug: true,
    },

    // Facebook app
    FACEBOOK: {
        version: 'v2.11',
        clientID: '298798940239793',
        clientSecret: 'a188fb4d7a070e675fa53c21e7ea41ec'
    },

    // location of public / private keys
    KEYS: {
        publicKeyPath: __dirname + '/keys/jwtRS256.key.pub',
        privatKeyPath: __dirname + '/keys/jwtRS256.key'
    },

    // Encoding auth tokens
    TOKEN: {
        algorithm: ALGORITHM,
        expiresIn: '1d',
        issuer: URL,
    },

    // Decoding auth tokens
    JWT: {
        issuer: URL,
        algorithms: [ALGORITHM],
        credentialsRequired: false
    },

    // Revoking auth tokens
    BLACKLIST: {
        store: {
            type: 'redis',
            options: {
                db: 5
            }
        }
    },
}

module.exports = CONF