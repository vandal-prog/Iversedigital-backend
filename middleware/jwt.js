import jwt from 'jsonwebtoken';
import createError from '../utils/createError.js';
import User from '../models/user_model.js';

export const verifyUserToken = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) return next(createError(401, 'You are not authenticated!'));

  const token = authHeader.split(' ')[1];
  const token_keyword = authHeader.split(' ')[0];

  if ( token_keyword !== 'Bearer' ) return next(createError(401, 'You are not authenticated!'))

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return next(createError(403, 'Token is not valid!'));

    const getUser = await User.findById(payload.id)

    if ( !getUser ) return next(createError(403, 'Invalid User Token!'))

    req.user = getUser;
    next();
  });
};

export const verifyAdminToken = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) return next(createError(401, 'You are not authenticated!'));

  const token = authHeader.split(' ')[1];
  const token_keyword = authHeader.split(' ')[0];

  if ( token_keyword !== 'Bearer' ) return next(createError(401, 'You are not authenticated!'))

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return next(createError(403, 'Token is not valid!'));

    const getUser = await User.findById(payload.id)

    if ( !getUser ) return next(createError(403, 'Invalid User Token!'))

    if ( getUser.role !== 'admin' ) return next(createError(403, 'Only Admin have the right to perform this action'))

    req.user = getUser;
    next();
  });
};
