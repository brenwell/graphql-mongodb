const config = require('./config');
const fs = require('fs')
const colors = require('colors')
const ip = require('ip');
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const redis = require("redis")
const jwt = require('express-jwt');
const blacklist = require('express-jwt-blacklist');
const {makeExecutableSchema} = require('graphql-tools')
const tokenizer = require('./src/token')
const {setup} = require('./src/db')
const auth = require('./src/auth')
const graphqlResolvers = require('./src/graphql/resolvers')
const graphqlServer = require('./src/graphql/server')
const typeDefs = require('./src/graphql/type-defs')
const privatKey = fs.readFileSync(config.KEYS.privatKeyPath)
const publicKey = fs.readFileSync(config.KEYS.publicKeyPath)

/**
 * The main function, this is where it all begins
 */
async function main()
{
    // setup authentication
    auth.configure(config.FACEBOOK, config.ROLES)

    // connect to db & get resolvers
    const collections = await setup(config.DB_URL)

    // build graphql resolvers
    const resolvers = graphqlResolvers(collections, config.ROLES)

    // make Graphql schema
    const schema = makeExecutableSchema({typeDefs,resolvers})

    // start Express app
    const app = express()

    // some api protection headers
    app.use(helmet())

    // Add cross domain shit
    app.use(cors())

    // setup token encodeer
    tokenizer.init(privatKey, config.TOKEN)

    // configure blacklist
    blacklist.configure(config.BLACKLIST);

    // decode options
    app.use(jwt({
        secret: publicKey,
        isRevoked: blacklist.isRevoked,
        ...config.JWT
    }));

    app.use((req, res, next) => {
        console.log(req.user)
        next()
    })

    // add root route for checking uptime
    app.get('/', (req, res) =>  res.send(`OK - ${new Date()}`) )

    // setup graphql and context for authorization
    app.use(config.API_ROUTE, graphqlServer(schema, config.GRAPHQL));

    // start server
    app.listen(config.PORT, () => {
        console.log(`${config.URL}${config.API_ROUTE}`.cyan)
        console.log(`http://${ip.address()}${config.API_ROUTE}`.cyan)
    })
}

main()