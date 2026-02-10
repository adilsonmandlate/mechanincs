export interface RegisterClientDto {
  name: string
  msisdn: string
  password: string
  gender: 'male' | 'female'
  birthdate?: Date
}
