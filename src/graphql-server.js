const graphqlHTTP = require('express-graphql');

function init(schema)
{
    return graphqlHTTP(async (req, res) =>
    {
        const startTime = Date.now();

        const { user } = req

        return {
            schema: schema,
            graphiql: true,
            rootValue: {environment: 'dev'},
            context: { user, res },
            extensions({ document, variables, operationName, result }) {
              return { runTime: Date.now() - startTime };
            },
            formatError: error => ({
                message: error.message,
                locations: error.locations,
                stack: error.stack,
                path: error.path
            })
        }
    })
}

module.exports = init