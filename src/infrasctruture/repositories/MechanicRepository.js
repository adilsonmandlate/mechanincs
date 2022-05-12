class MechanicRepository {
  async add() {
    // Add mechanic to database
    return { name: 'adilson', email: 'adilson@mech.co.mz' }
  }

  async getById() {
    // Get mechanic from database
    return
  }
}

module.exports = MechanicRepository
