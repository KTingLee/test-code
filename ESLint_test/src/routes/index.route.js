import { Router } from 'express'
import httpStatus from 'http-status'
import JWT from 'jsonwebtoken'

import authRoutes from './auth.route'
import userRoutes from './user.route'
import systemRoutes from './system.route'
import roleRoutes from './role.route'

const debug = require('debug')('protp:route:index')

const router = Router()

router.use('/auth', authRoutes)
router.use('/roles', checkAuth, roleRoutes)
router.use('/users', checkAuth, jwtVerify, userRoutes)

function checkAuth (req, res, next) {
  if (!req.session || !req.session.authenticated) {
    return res.status(httpStatus.UNAUTHORIZED).json({message: `Authentication error`})
  } else {
    next()
  }
}

function jwtVerify (req, res, next) {
  try {
    JWT.verify(req.headers.Authorization, 'protp55688')
    next()
  } catch (e) {
    next(e)
  }
}

export default router
