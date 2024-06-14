import { Product } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true
  })
  email: string;

  @Column('text')
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', {
    default: true
  })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: ['user']
  })
  roles: string[];

  @OneToMany(
    () => Product,
    (product) => product.user
  )
  product: Product;

  @BeforeInsert()
  checkFieldsBeforeInsert(){
    this.email = this.email.toLowerCase().trim();
  }
  
  @BeforeUpdate()
  checkFieldsBeforeUpdate(){
    this.email = this.email.toLowerCase().trim();
  }
}
