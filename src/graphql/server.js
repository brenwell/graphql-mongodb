const graphqlHTTP = require('express-graphql');

const defaults = {
    graphiql: true,
    debug: false,
}

function init(schema, opts)
{
    opts = Object.assign({}, defaults, opts)

    return graphqlHTTP(async (req, res) =>
    {
        const startTime = Date.now();

        const { user } = req

        return {
            schema: schema,
            graphiql: opts.graphiql,
            context: { user, res },
            extensions({ document, variables, operationName, result }) {
                return (!opts.debug) ? {} : {
                    runTime: Date.now() - startTime
                }
            },
            formatError: error => {
                return (!opts.debug) ? {} : {
                    message: error.message,
                    locations: error.locations,
                    stack: error.stack,
                    path: error.path
                }
            }
        }
    })
}

module.exports = init