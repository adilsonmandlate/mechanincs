export class AppException extends Error {
  public status: number
  public code: string

  constructor(message: string, status: number, code: string) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.code = code
  }
}
