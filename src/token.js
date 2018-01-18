const jwt = require('jsonwebtoken');

let options
let secret

function init(sec, opts)
{
    options = opts
    secret = sec
}

/**
 * Create a JWT from an oject
 *
 * @param  {<type>}  o        User object tradionally, must have id
 * @return {<type>}  { description_of_the_return_value }
 */
function encode(o)
{
    if (!secret)
    {
        throw new Error('Token secret not set')
    }

    if (!o._id)
    {
        throw new Error('Object must have a _id')
    }

    const subject = o._id.toString()

    const opts = {
        ...options,
        subject
    }

    return jwt.sign(o, secret, opts);
}

module.exports = {
    init,
    encode,
}