export interface RegisterProfessionalDto {
  name: string
  msisdn: string
  password: string
  gender: 'male' | 'female'
  birthdate?: Date
  professionId: number
  education: 'none' | 'primary' | 'secondary' | 'university' | 'master' | 'phd'
  yearsOfExperience: number
  about?: string
  location: { latitude: number; longitude: number }
}

