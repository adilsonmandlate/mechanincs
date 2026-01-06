export interface RegisterClientDto {
  name: string
  email: string
  msisdn: string
  password: string
  gender: 'male' | 'female'
  birthdate?: Date
}

