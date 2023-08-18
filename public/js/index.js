const issueTemplate = document.querySelector('#issue-template')
// If issueTemplate is not present on the page, just ignore and do not listen for issue messages.
const baseURL = document.querySelector('base').getAttribute('href')
if (issueTemplate) {
  await import('../socket.io/socket.io.js')
  // Create a socket connection using Socket.IO.
  const socket = window.io({ path: `${baseURL}socket.io` })
  // Listen for "issues/create" message from the server.
  socket.on('issues/create', (issue) => {
    insertIssueRow(issue)
  })
  // Listen for "issues/update" message from the server.
  socket.on('issues/update', (issue) => {
    updateIssueRow(issue)
  })
}

/**
 * Inserts a issue row at the end of the issue table.
 *
 * @param {object} issue - The issue to add.
 */
function insertIssueRow (issue) {
  const issueList = document.querySelector('#issue-list')

  const issueNode = issueTemplate.content.cloneNode(true)

  const issueRow = issueNode.querySelector('tr')
  const doneCheck = issueNode.querySelector('input[type=checkbox]')
  const avatarImgEl = issueNode.querySelector('#avatarPhoto')
  const titelCell = issueNode.querySelector('td:nth-child(3)')
  const descriptionCell = issueNode.querySelector('td:nth-child(4)')
  const updateLink = issueNode.querySelector('a')

  issueRow.setAttribute('data-iid', issue.gitlabIid)

  if (issue.done) {
    doneCheck.setAttribute('checked', '')
    descriptionCell.classList.add('text-muted')
  } else {
    doneCheck.removeAttribute('checked')
    descriptionCell.classList.remove('text-muted')
  }

  avatarImgEl.setAttribute('src', issue.avatar)
  avatarImgEl.setAttribute('alt', 'Gravatar')
  console.log(avatarImgEl)
  titelCell.textContent = issue.title
  descriptionCell.textContent = issue.description

  updateLink.href = `./issues/${issue.gitlabIid}/update`

  issueList.appendChild(issueNode)
}

/**
 * Updates a issue row at the end of the issue table.
 *
 * @param {object} issue - The issue to add.
 */
function updateIssueRow (issue) {
  const issueList = document.querySelector('#issue-list')
  const existingIssueNode = issueList.querySelector(`[data-id="${issue.gitlabIid}"]`)
  const existingTitleCell = existingIssueNode.querySelector('td:nth-child(3)')
  const existingDescriptionCell = existingIssueNode.querySelector('td:nth-child(4)')
  const existingDoneCheck = existingIssueNode.querySelector('input[type=checkbox]')

  existingTitleCell.textContent = issue.title
  existingDescriptionCell.textContent = issue.description
  if (issue.done) {
    existingDoneCheck.setAttribute('checked', '')
    existingDescriptionCell.classList.add('text-muted')
  } else {
    existingDoneCheck.removeAttribute('checked')
    existingDescriptionCell.classList.remove('text-muted')
  }
}
