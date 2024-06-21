import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity {
  @ApiProperty({
    example: 'aasdsadas-asdasd-sad11qweqweq',
    description: 'User ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'email@email.com',
    description: 'User email',
    uniqueItems: true
  })
  @Column('text', {
    unique: true
  })
  email: string;

  @ApiProperty({})
  @Column('text')
  password: string;

  @ApiProperty({})
  @Column('text')
  fullName: string;

  @ApiProperty({})
  @Column('bool', {
    default: true
  })
  isActive: boolean;

  @ApiProperty({})
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
