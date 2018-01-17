// Get config
const config = require('config-yml');
const url = `${config.HOST}:${config.PORT}`

const express = require('express')
const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('graphql-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const cors = require('cors')
const DB = require('./db')
const typeDefs = require('./type-defs')
const router = require('./router')
const {auth, authSetup} = require('./auth')

async function main()
{
    // connect to db & get resolvers
    const {resolvers, getUserById, getOrCreateUser} = await DB(config.DB_URL)

    // make Graphql schema
    const schema = makeExecutableSchema({typeDefs,resolvers})

    // setup passport authentication
    const passport = authSetup({
        clientID: config.FACEBOOK.ID,
        clientSecret: config.FACEBOOK.SECRET,
        callbackURL: `${url}${config.FACEBOOK.CALLBACK}`
    },getUserById, getOrCreateUser)

    // start Express app
    const app = express()

    app.use(passport.initialize());
    app.use(passport.session());

    // Add cross domain shit
    app.use(cors())

    // add route graphql aka api
    app.use(config.GRAPHQL_PATH, bodyParser.json(), graphqlExpress({schema}))

    // add route to graphiql
    app.use(config.GRAPHIQL_PATH, graphiqlExpress({endpointURL: '/graphql'}))

    // add frontend router
    app.use('/',router)

    // add auth router
    app.use('/auth',auth)

    // start server
    app.listen(config.PORT, () => {
      console.log(`Visit ${url}${config.GRAPHIQL_PATH}`)
    })
}

main()