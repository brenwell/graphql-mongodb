// Get config
const config = require('config-yml');
const url = `${config.HOST}:${config.PORT}`
const secret = '9+d3VaTe)337VdXay3kmk3qsM6uH(skh?Cau,dEDJHfqATgy/CpXDo@Z{cJ3u?#4'
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const jwt = require('express-jwt');

const {makeExecutableSchema} = require('graphql-tools')

const {setup} = require('./db')
const typeDefs = require('./type-defs')
const router = require('./router')
const {authRouter, authSetup} = require('./auth')
const graphqlResolvers = require('./graphql-resolvers')
const graphqlServer = require('./graphql-server')

async function main()
{
    // connect to db & get resolvers
    const collections = await setup(config.DB_URL)

    // build graphql resolvers
    const resolvers = graphqlResolvers(collections)

    // make Graphql schema
    const schema = makeExecutableSchema({typeDefs,resolvers})

    // setup passport authentication
    const passport = authSetup({
        clientID: config.FACEBOOK.ID,
        clientSecret: config.FACEBOOK.SECRET,
    })

    // start Express app
    const app = express()

    // some api protection headers
    app.use(helmet())

    // Add cross domain shit
    app.use(cors())

    // const tokenOpts = {
    //     secret,
    //     issuer: url
    // }

    // app.use(jwt(tokenOpts).unless({path: ['/auth']}));

    // app.use((req,res,next) => {
    //     console.log(req.user)
    //     next()
    // })

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