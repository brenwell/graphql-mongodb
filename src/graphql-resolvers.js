const ROLES = require('./roles')
const { getUserFromToken } = require('./session')

/**
 * Connect graphql to MongoDB
 *
 * @param  {Object}  arg1           The argument 1
 * @param  {<type>}  arg1.Posts     The posts
 * @param  {<type>}  arg1.Comments  The comments
 * @return {Object}  { description_of_the_return_value }
 */
function resolvers({Users,Posts,Comments})
{
    return {
        Query: {
            user: async (root, {_id}) => {
                return await Users.findOne(ObjectId(_id))
            },
            post: async (root, {_id}) => {
                return await Posts.findOne(ObjectId(_id))
            },
            posts: async () => {
                return await Posts.find({}).toArray()
            },
            comment: async (root, {_id}) => {
                return await Comments.findOne(ObjectId(_id))
            },
        },
        Post: {
            comments: async ({_id}) => {
                return await Comments.find({postId: _id}).toArray()
            }
        },
        Comment: {
            post: async ({postId}) => {
                return await Posts.findOne(ObjectId(postId))
            }
        },
        Mutation: {
            createUser: AUTHENTICATE( ROLES.admin,
                async (root, args, context, info) => {
                    const res = await Users.insert(args)
                    return res.ops[0]
                }
            ),
            createPost: AUTHENTICATE( ROLES.user,
                async (root, args, context, info) => {
                    const res = await Posts.insert(args)
                    return res.ops[0]
                }
            ),
            createComment: AUTHENTICATE( ROLES.user,
                async (root, args) => {
                    const res = await Comments.insert(args)
                    return res.ops[0]
                }
            ),
        },
    }
}

module.exports = resolvers

function AUTHENTICATE(role, fn)
{
    function call(...args)
    {
        if ( !args || args[2] || !args[2].user )
        {
            throw new Error('User is not AUTHENTICATED');
            return
        }

        if(!user || role > user.role)
        {
            throw new Error('User is not AUTHORIZED');
            return
        }

        fn(...args)
    }

    return call
}
