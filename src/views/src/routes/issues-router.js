/**
 * Issues routes.
 *
 * @author Vanja Maric
 * @version 2.0.0
 */

import express from 'express'
import { IssuesController } from '../controllers/issues-controller.js'

export const router = express.Router()

const controller = new IssuesController()

// Map HTTP verbs and route paths to controller action methods.

router.get('/', (req, res, next) => controller.index(req, res, next))

router.get('/create', (req, res, next) => controller.create(req, res, next))
router.post('/create', (req, res, next) => controller.createPost(req, res, next))

router.get('/:gitlabIid/update', (req, res, next) => controller.update(req, res, next))
router.post('/:gitlabIid/update', (req, res, next) => controller.updatePost(req, res, next))
