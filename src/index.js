// Get config
const config = require('config-yml');
const url = `${config.HOST}:${config.PORT}`
const privatKey = require('fs').readFileSync(__dirname + '/../keys/jwtRS256.key')
const publicKey = require('fs').readFileSync(__dirname + '/../keys/jwtRS256.key.pub')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const redis = require("redis")
const jwt = require('express-jwt');
const blacklist = require('express-jwt-blacklist');

const {makeExecutableSchema} = require('graphql-tools')

const {setup} = require('./db')
const typeDefs = require('./type-defs')
const router = require('./router')
const {authRouter, authSetup} = require('./auth')
const graphqlResolvers = require('./graphql-resolvers')
const graphqlServer = require('./graphql-server')
const tokenizer = require('./token')

async function main()
{
    // connect to db & get resolvers
    const collections = await setup(config.DB_URL)

    // build graphql resolvers
    const resolvers = graphqlResolvers(collections)

    // make Graphql schema
    const schema = makeExecutableSchema({typeDefs,resolvers})

    // setup passport authentication
    const passport = authSetup(config.FACEBOOK)

    // start Express app
    const app = express()

    // some api protection headers
    app.use(helmet())

    // Add cross domain shit
    app.use(cors())

    // get redis client
    const client = redis.createClient(config.REDIS)

    // setup token encodeer
    tokenizer.init(privatKey, {
        issuer: url,
        algorithm: 'RS256',
        expiresIn: '1d'
    })

    // configure blacklist
    blacklist.configure({
        store: {
            type: 'redis',
            client: client
        }
    });

    // decode options
    const tokenOpts = {
        secret: publicKey,
        issuer: url,
        credentialsRequired: false,
        isRevoked: blacklist.isRevoked,
        algorithms: ['RS256']
    }

    // setup token decoder
    app.use(jwt(tokenOpts));

    // use passport
    app.use(passport.initialize());

    // add frontend router
    app.use('/', router)

    // add auth router
    app.use('/auth', authRouter)

    // setup graphql and context for authorization
    app.use('/graphql', graphqlServer(schema));

    // start server
    app.listen(config.PORT, () => {
      console.log(`Visit ${url}/graphql`)
    })
}

main()