const {MongoClient, ObjectId} = require('mongodb')

/**
 * Connect to MongoDB & return resolvers
 *
 * @param  {<type>}  MONGO_URL  The mongo url
 * @return {Object}  { description_of_the_return_value }
 */
const init = async (MONGO_URL) =>
{
    const db = await MongoClient.connect(MONGO_URL)

    const Users = db.collection('users')
    const Posts = db.collection('posts')
    const Comments = db.collection('comments')

    // for fb auth
    function getUserById(id, cb)
    {
        Users.findOne(ObjectId(id), cb)
    }

    // for fb auth
    function getOrCreateUser(user, cb)
    {
        Users.findOne({facebookId: user.facebookId}, (err,result) => {

            if (!result || err)
            {
                Users.insert(user,cb)
            }

            cb(err,result)
        })
    }

    return {
        getUserById,
        getOrCreateUser,
        resolvers: resolvers({Users,Posts,Comments})
    }
}

module.exports = init

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
                return prepare(await Users.findOne(ObjectId(_id)))
            },
            post: async (root, {_id}) => {
                return prepare(await Posts.findOne(ObjectId(_id)))
            },
            posts: async () => {
                return (await Posts.find({}).toArray()).map(prepare)
            },
            comment: async (root, {_id}) => {
                return prepare(await Comments.findOne(ObjectId(_id)))
            },
        },
        Post: {
            comments: async ({_id}) => {
                return (await Comments.find({postId: _id}).toArray()).map(prepare)
            }
        },
        Comment: {
            post: async ({postId}) => {
                return prepare(await Posts.findOne(ObjectId(postId)))
            }
        },
        Mutation: {
            createUser: async (root, args, context, info) => {
                const res = await Users.insert(args)
                return res.ops[0]
            },
            createPost: async (root, args, context, info) => {
                const res = await Posts.insert(args)
                return res.ops[0]
            },
            createComment: async (root, args) => {
                const res = await Comments.insert(args)
                return res.ops[0]
            },
        },
    }
}

/**
 * Transforms _id from an ObjectId into a string.
 *
 * @param  {object}  o  the original Object
 */
function prepare(o)
{
    const idStr = o._id.toString()
    return {
        ...o,
        _id: idStr
    }
}