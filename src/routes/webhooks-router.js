/**
 * Webhooks routes.
 *
 * @author Vanja Maric
 * @version 2.0.0
 */

import express from 'express'
import { WebhooksController } from '../controllers/webhooks-controller.js'

export const router = express.Router()

const webhooksController = new WebhooksController()

// Map HTTP verbs and route paths to controller actions.
router.post('/',
  (req, res, next) => webhooksController.authenticate(req, res, next),
  (req, res, next) => webhooksController.indexPost(req, res, next)
)
