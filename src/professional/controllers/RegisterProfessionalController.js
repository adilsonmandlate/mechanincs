const res = require('../../main/helpers/http-response')

const RegisterProfessionalController = (req, repository) => {
  const { firstname, lastname, email, phone, password } = req.body

  if (!firstname || !lastname || !email) {
    return res.serverError(400, 'Insert all required data')
  }

  const professionalData = {
    firstname,
    lastname,
    email,
    phone,
    password
  }

  return repository
    .add(professionalData)
    .then((professional) => res.ok(professional))
    .catch((err) => {
      if (err.code === 'P2002') {
        return res.serverError(
          409,
          'There is a unique constraint violation, a new user cannot be created with this email and phone'
        )
      }
      return res.serverError(500, err)
    })
}

module.exports = RegisterProfessionalController
