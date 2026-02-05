export interface FindNearbyMechanicsDto {
  latitude: number
  longitude: number
  radius?: number // em km, default pode ser 10
}
