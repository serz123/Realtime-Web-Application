/**
 * Module for the IssuesController.
 *
 * @author Vanja Maric
 * @version 2.0.0
 */

import fetch from 'node-fetch'

/**
 * Encapsulates a controller.
 */
export class IssuesController {
  /**
   * Displays a list of issues.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async index (req, res, next) {
    try {
      const gitProjectURL = 'https://gitlab.lnu.se/api/v4/projects/30654/issues?state=opened&scope=all'
      const personalAccessToken = process.env.PERSONAL_ACCESS_TOKEN
      const response = await fetch(gitProjectURL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${personalAccessToken}`
        }
      })
      const data = await response.json()

      const issues = []

      for (const issueData of data) {
        const existingIssue = issues.find(issue => issue.title === issueData.title && issue.description === issueData.description)
        if (!existingIssue) {
          const issue = {
            title: issueData.title,
            description: issueData.description,
            avatar: issueData.author.avatar_url,
            gitlabIid: issueData.iid
          }
          issues.push(issue)
        }
      }

      const viewData = {
        issues: issues
      }
      // attach issues to app.locals
      res.app.locals.issues = issues

      res.render('issues/index', { viewData })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Returns a HTML form for updating a issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async update (req, res) {
    try {
      const gitProjectURL = `https://gitlab.lnu.se/api/v4/projects/30654/issues/${req.params.gitlabIid}`
      const personalAccessToken = process.env.PERSONAL_ACCESS_TOKEN
      const response = await fetch(gitProjectURL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${personalAccessToken}`
        }
      })
      const issueData = await response.json()

      const issue = {
        title: issueData.title,
        description: issueData.description,
        avatar: issueData.author.avatar_url,
        gitlabIid: issueData.iid
      }

      res.app.locals.issues = [issue]
      res.render('issues/update', { viewData: issue })
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('..')
    }
  }

  /**
   * Updates a specific issue.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   */
  async updatePost (req, res) {
    try {
      const issue = req.app.locals.issues.find(iss => parseInt(iss.gitlabIid) === parseInt(req.params.gitlabIid))
      if (issue) {
        const gitlabIssueURL = `https://gitlab.lnu.se/api/v4/projects/30654/issues/${issue.gitlabIid}`
        const personalAccessToken = process.env.PERSONAL_ACCESS_TOKEN
        if (issue.title !== req.body.title) {
          await fetch(gitlabIssueURL, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${personalAccessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: req.body.title })
          })
        }

        if (req.body.done) {
          await fetch(`${gitlabIssueURL}?state_event=close`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${personalAccessToken}`,
              'Content-Type': 'application/json'
            }
          })
        }
        res.app.locals.issues = [issue]
        req.session.flash = { type: 'success', text: 'The issue was updated successfully.' }
      } else {
        req.session.flash = {
          type: 'danger',
          text: 'The issue you attempted to update was removed by another user after you got the original values.'
        }
      }
      res.redirect('..')
    } catch (error) {
      req.session.flash = { type: 'danger', text: error.message }
      res.redirect('./update')
    }
  }
}
