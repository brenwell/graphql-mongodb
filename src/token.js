const jwt = require('jsonwebtoken');
const secret = '9+d3VaTe)337VdXay3kmk3qsM6uH(skh?Cau,dEDJHfqATgy/CpXDo@Z{cJ3u?#4'

function encode(o) {
    return jwt.sign(o, secret, { expiresIn: '1d' });
}

function decode(t, cb) {
    jwt.verify(t, secret, cb)
}

module.exports = {
    encode,
    decode
}