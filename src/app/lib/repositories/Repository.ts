/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Repository<T, ID = number> {
  constructor(protected modelDelegate: any) {}

  async create<CreateInput = Partial<T>>(data: CreateInput): Promise<T> {
    return await this.modelDelegate.create({
      data,
    });
  }

  async getAll(): Promise<T[]> {
    return await this.modelDelegate.findMany();
  }

  async getById(id: ID): Promise<T | null> {
    return await this.modelDelegate.findUnique({
      where: {
        id,
      },
    });
  }

  async update<UpdateInput = Partial<T>>(id: ID, data: UpdateInput): Promise<T> {
    return await this.modelDelegate.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: ID): Promise<T> {
    return await this.modelDelegate.delete({
      where: { 
        id,
      },
    });
  }
}