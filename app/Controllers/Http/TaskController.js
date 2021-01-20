'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const Task = use('App/Models/Task')

class TaskController {
  /**
   * Show a list of all tasks.
   * GET tasks
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ params, request, response, view }) {
    const tasks = await Task.query().where({ project_id: params.projects_id }).with('user').fetch()

    return tasks
  }

  /**
   * Create/save a new task.
   * POST tasks
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ params, request, response }) {
    const data = request.only([
      'user_id',
      'title',
      'description',
      'due_date',
      'file_id'
    ])
    const task = await Task.create({ ...data, project_id: params.projects_id })
    return task
  }

  /**
   * Display a single task.
   * GET tasks/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
    try {
      const task = await Task.findOrFail(params.id)
      await task.load('user')
      await task.load('project')
      await task.load('file')
      return task
    } catch (error) {
      console.log(error)
      return response.status(error.status).json({ error: { message: 'Error on show task' } })
    }
  }

  async update ({ params, request, response }) {
    const data = request.only([
      'user_id',
      'title',
      'description',
      'due_date',
      'file_id'
    ])
    try {
      const task = await Task.findOrFail(params.id)
      task.merge(data)
      await task.save()
      return task
    } catch (error) {
      console.log(error)
      return response.status(error.status).json({ error: { message: 'Error on update task' } })
    }
  }

  /**
   * Delete a task with id.
   * DELETE tasks/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
    try {
      const task = await Task.findOrFail(params.id)

      await task.delete()
      return response.status(200).json({ deleted: true })
    } catch (error) {
      console.log(error)
      return response.status(error.status).json({ error: { message: 'Error on delete task' } })
    }
  }
}

module.exports = TaskController
