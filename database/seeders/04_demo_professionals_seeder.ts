import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import UserRole from '#models/user_role'
import Profession from '#models/profession'
import ProfessionalProfile from '#models/professional_profile'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

const demoProfessionals = [
  ['Carlos Mucavele', '841000001', -25.9663, 32.5832],
  ['Marta Nhantumbo', '841000002', -25.9711, 32.5895],
  ['João Mabunda', '841000003', -25.9602, 32.5751],
  ['Helena Cossa', '841000004', -25.9549, 32.6021],
  ['António Dlamini', '841000005', -25.9828, 32.5717],
  ['Rosa Bila', '841000006', -25.9487, 32.5643],
  ['Miguel Chissano', '841000007', -25.9904, 32.5974],
  ['Sofia Matola', '841000008', -25.9367, 32.5828],
  ['Paulo Macamo', '841000009', -25.9738, 32.6122],
  ['Teresa Mavie', '841000010', -25.9575, 32.5431],
  ['Filipe Mondlane', '841000011', -25.9462, 32.6168],
  ['Lúcia Massango', '841000012', -25.99856651093548, 32.5383619557591],
  ['Daniel Nhampossa', '841000013', -25.9301, 32.5933],
  ['Célia Tembe', '841000014', -25.9658, 32.6324],
  ['Rui Sithole', '841000015', -26.001420800217716, 32.56095264075802],
  ['Amélia Chauque', '841000016', -25.9419, 32.5489],
  ['Bento Zitha', '841000017', -25.989094963649677, 32.5553230132274],
  ['Graça Machel', '841000018', -25.9235, 32.5702],
  ['Nelson Cuinica', '841000019', -26.027719, 32.550023],
  ['Isabel Guambe', '841000020', -25.9528, 32.6259],
  ['Victor Maluleque', '841000021', -26.033786180470262, 32.559292623801014],
  ['Eva Jasse', '841000022', -25.9383, 32.6079],
  ['Samuel Mucavel', '841000023', -26.062058042265274, 32.58931730617269],
  ['Beatriz Manjate', '841000024', -25.9209, 32.5476],
  ['Osvaldo Ndlovu', '841000025', -25.9631, 32.5208],
  ['Ana Langa', '841000026', -26.037547509398163, 32.60144265764422],
  ['Tomás Ussene', '841000027', -25.9148, 32.5881],
  ['Ema Matusse', '841000028', -25.9324, 32.5257],
  ['Jorge Mussa', '841000029', -26.01160485795224, 32.5595091482722],
  ['Laura Sitoe', '841000030', -25.9041, 32.6117],
] as const

export default class extends BaseSeeder {
  async run() {
    const profession = await Profession.findBy('code', 'mecanico')
    if (!profession) {
      console.warn('Profession "mecanico" not found. Please run profession_seeder first.')
      return
    }

    const password = await hash.make('Demo12345!')

    for (const [name, msisdn, latitude, longitude] of demoProfessionals) {
      const user = await User.firstOrCreate(
        { msisdn },
        {
          name,
          msisdn,
          password,
          gender: 'male',
          msisdnVerifiedAt: DateTime.now(),
        }
      )

      await UserRole.firstOrCreate({
        userId: user.id,
        role: 'professional',
      })

      await ProfessionalProfile.firstOrCreate(
        { userId: user.id },
        {
          userId: user.id,
          professionId: profession.id,
          education: 'secondary',
          yearsOfExperience: 5,
          about: 'Profissional de demonstração disponível para atendimento SOS.',
          status: 'free',
          ratingAvg: 4.7,
          ratingCount: 12,
          location: `POINT(${longitude} ${latitude})`,
          isVerified: true,
        }
      )
    }
  }
}
