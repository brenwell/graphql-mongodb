const { ObjectId } = require('mongodb')

const {
    authenticate,
    authorizeFacebookUser,
    deauthorizeUser
} = require('../auth')

/**
 * Connect graphql to MongoDB
 *
 * @param  {Object}  arg1           The argument 1
 * @param  {<type>}  arg1.Posts     The posts
 * @param  {<type>}  arg1.Comments  The comments
 * @return {Object}  { description_of_the_return_value }
 */
function resolvers({Users,Posts,Comments}, ROLES)
{
    return {
        Query:
        {
            viewer: async (root, {token}, {user}) => {
                return await Users.findOne(ObjectId(user._id))
            },
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
        Post:
        {
            comments: async ({_id}) => {
                return await Comments.find({postId: _id}).toArray()
            }
        },
        Comment:
        {
            post: async ({postId}) => {
                return await Posts.findOne(ObjectId(postId))
            }
        },
        Mutation:
        {
            authorizeUser: async (root, { accessToken }) => {
                return await authorizeFacebookUser(accessToken)
            },
            deauthorizeUser: async (root, args, { user }) => {
                return await deauthorizeUser(user)
            },
            createUser: authenticate( ROLES.admin,
                async (root, args, context, info) => {
                    const res = await Users.insert(args)
                    return res.ops[0]
                }
            ),
            createPost: authenticate( ROLES.user,
                async (root, args, context, info) => {
                    const res = await Posts.insert(args)
                    return res.ops[0]
                }
            ),
            createComment: authenticate( ROLES.user,
                async (root, args) => {
                    const res = await Comments.insert(args)
                    return res.ops[0]
                }
            ),
        },
    }
}

module.exports = resolvers



