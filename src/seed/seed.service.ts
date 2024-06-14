import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ){}

  async runSeed() {
    await this.deleteTables();

    const adminUser = await this.insertUsers();

    await this.inserNewProducts(adminUser);
    return {
      msg: 'seed completed'
    };
  }

  private async deleteTables(){
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete()
                      .where({})
                      .execute()
  }

  private async insertUsers(){
    const seedUsers = initialData.users;
    const users: UserEntity[] = [];

    seedUsers.forEach( user => {
      users.push( this.userRepository.create( user ) );
    });
    const dbUsers = await this.userRepository.save( seedUsers );

    return dbUsers[0];
  }

  private async inserNewProducts(user: UserEntity){
    await this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.productService.create(product, user) );
    });

    await Promise.all(insertPromises);

    return true
  }

}
