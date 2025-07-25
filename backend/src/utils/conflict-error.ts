
export class ConflictError extends Error {
  conflictData: any = null;
  constructor(message: string, data: any) {
    super(message);
    this.conflictData = data;
    this.name = 'ConflictError';
  }
}