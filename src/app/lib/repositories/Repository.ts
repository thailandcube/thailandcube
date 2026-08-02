/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Repository<T> {
  constructor(protected modelDelegate: any) {}

  async create<CreateInput = Partial<T>>(data: CreateInput): Promise<T> {
    return await this.modelDelegate.create({
      data,
    });
  }

  async getAll(): Promise<T[]> {
    return await this.modelDelegate.findMany();
  }

  async getById(id: number): Promise<T | null> {
    return await this.modelDelegate.findUnique({
      where: {
        id,
      },
    });
  }

  async update<UpdateInput = Partial<T>>(id: number, data: UpdateInput): Promise<T> {
    return await this.modelDelegate.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: number): Promise<T> {
    return await this.modelDelegate.delete({
      where: { 
        id,
      },
    });
  }
}