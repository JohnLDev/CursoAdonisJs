'use strict'
const User = use('App/Models/User')
const crypto = require('crypto')
const Mail = use('Mail')
const Moment = require('moment')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)
      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()
      await Mail.send(
        ['emails.forgot_password'],
        { email, token: user.token, link: `${request.input('redirect_url')}?token=${user.token}` },
        message => {
          message.to(user.email).from('johnlenon@lubysoftware').subject('Recuperação de senha')
        }
      )
      return { message: 'email de recuperação enviado' }
    } catch (error) {
      return response.status(error.status).send({ error: { message: 'email inexistente' } })
    }
  }

  async update ({ request, response }) {
    const { newPassword, token } = request.all()
    try {
      const user = await User.findByOrFail('token', token)
      const tokenExpired = Moment().subtract('2', 'days').isAfter(user.token_created_at)
      if (tokenExpired) {
        return response.status(401).send({ error: { message: 'Token expired' } })
      }
      user.token = null
      user.token_created_at = null
      user.password = newPassword
      await user.save()
      return user
    } catch (error) {
      return response.status(error.status).send({ error: { message: 'Token invalid' } })
    }
  }
}

module.exports = ForgotPasswordController
