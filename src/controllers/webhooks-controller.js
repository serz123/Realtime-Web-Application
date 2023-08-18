/**
 * Module for the WebhooksController.
 *
 * @author Vanja Maric
 * @version 2.0.0
 */

/**
 * Encapsulates a controller.
 */
export class WebhooksController {
  /**
   * Authenticates the webhook.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  authenticate (req, res, next) {
    console.log('AUTHENTICATION')
    // Use the GitLab secret token to validate the received payload.
    if (req.headers['x-gitlab-token'] !== process.env.WEBHOOK_SECRET) {
      const error = new Error('Invalid token')
      error.status = 401
      next(error)
      return
    }

    next()
  }

  /**
   * Receives a webhook, and creates a new issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async indexPost (req, res, next) {
    try {
      console.log('INDEXPOST')
      let issue = null
      if (req.body.event_type === 'issue') {
        // check if issue already exists
        issue = req.app.locals.issues.find(issue => issue.gitlabIid === req.body.object_attributes.iid)
        if (issue) {
          issue.title = req.body.object_attributes.title
          if (req.body.object_attributes.state === 'closed') {
            issue.done = true
          } else {
            issue.done = false
          }
          issue.description = req.body.object_attributes.description
          issue.avatar = req.body.user.avatar_url
          res.io.emit('issues/update', issue)
        } else {
          // Create a new issue
          issue = {
            title: req.body.object_attributes.title,
            description: req.body.object_attributes.description,
            avatar: req.body.user.avatar_url,
            gitlabIid: req.body.object_attributes.iid
          }
          req.app.locals.issues.push(issue)
          res.io.emit('issues/create', issue)
        }

        // It is important to respond quickly!
        res.status(200).end()
      }
    } catch (error) {
      const err = new Error('Internal Server Error')
      err.status = 500
      next(err)
    }
  }
}
