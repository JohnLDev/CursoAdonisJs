'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const Project = use('App/Models/Project')
class ProjectController {
  /**
   * Show a list of all projects.
   * GET projects
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    const { page } = request.get()
    const project = await Project.query().with('user').paginate(page)

    return response.status(200).json(project)
  }

  /**
   * Render a form to be used for creating a new project.
   * GET projects/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */

  async store ({ request, response, auth }) {
    const data = request.only(['title', 'description'])
    const project = await Project.create({ ...data, user_id: auth.user.id })
    return project
  }

  /**
   * Display a single project.
   * GET projects/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view, auth }) {
    try {
      const project = await Project.findOrFail(params.id)
      await project.load('user')
      await project.load('tasks')
      return project
    } catch (error) {
      return response.status(error.status).json({ error: { message: 'Error on search project' } })
    }
  }

  /**
   * Update project details.
   * PUT or PATCH projects/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
    const data = request.only(['title', 'description'])
    try {
      const project = await Project.findOrFail(params.id)
      project.merge(data)
      await project.save()
      return project
    } catch (error) {
      return response.status(error.status).json({ error: { message: 'Error on update project' } })
    }
  }

  /**
   * Delete a project with id.
   * DELETE projects/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, response, auth }) {
    const project = await Project.findOrFail(params.id)
    if (!project.user_id === auth.user.id) {
      throw new Error('Project not found')
    }
    await project.delete()
    return response.status(200).json({ deleted: true })
  }
}

module.exports = ProjectController
