export interface CreateSosRequestDto {
  professionalId: number
  problemDescription: string
  location: { latitude: number; longitude: number }
}
