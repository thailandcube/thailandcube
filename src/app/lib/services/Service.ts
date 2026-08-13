/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from '../repositories/Repository';

export abstract class Service<DbModel, Repo extends Repository<DbModel, any>, DtoModel = DbModel, ID = number> {
  constructor(protected repository: Repo) {}

  protected format(data: DbModel): DtoModel {
    return data as unknown as DtoModel;
  }

  async create<CreateInput = Partial<DbModel>>(data: CreateInput): Promise<DtoModel> {
    const createdRecord = await this.repository.create(data);
    
    return this.format(createdRecord);
  }

  async getAll(): Promise<DtoModel[]> {
    const records = await this.repository.getAll();
    return records.map((record) => this.format(record)); 
  }

  async getById(id: ID): Promise<DtoModel> {
    const record = await this.repository.getById(id);
    
    if (!record)
      throw new Error('Resource not found'); 
    
    return this.format(record);
  }

  async update<UpdateInput = Partial<DbModel>>(id: ID, data: UpdateInput): Promise<DtoModel> {
    const updatedRecord = await this.repository.update(id, data);
    
    return this.format(updatedRecord);
  }

  async delete(id: ID): Promise<DtoModel> {
    const deletedRecord = await this.repository.delete(id);

    return this.format(deletedRecord);
  }
}