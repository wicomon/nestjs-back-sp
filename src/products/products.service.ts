import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-image.entity';
import { UserEntity } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: UserEntity) {
    // const product  = new Product();
    const {images= [], ...productDetails} = createProductDto;
    try {
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( image => this.productImageRepository.create({url: image})),
        user
      });
      await this.productRepository.save(product);

      return {
        ...product,
        images
      };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        // TODO: Relaciones
        relations: {
          images: true,
        }
      });
      return products.map ( ({images, ...rest}) => ({
        ...rest,
        images: images.map( img => img.url)
      }))
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findOnePlain(term: string){
    const {images=[], ...rest} = await this.findOne(term);
    return {
      ...rest,
      images: images.map( img => img.url)
    }
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // product = await this.productRepository.findOneBy({slug: term});
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title)=:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) throw new NotFoundException('producto no encontrado');

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: UserEntity) {

    const {images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
      // images: []
    });

    if ( !product ) throw new NotFoundException(`Product with id: ${id} not found`);

    // create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if ( images ) {
        await queryRunner.manager.delete( ProductImage, {product: { id }} );
        product.images = images.map( img => this.productImageRepository.create({ url: img}))
      }
      product.user=user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.productRepository.save(product)
      return this.findOnePlain(product.id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    const deletedProduct = await this.productRepository.delete({ id });
    return deletedProduct;
  }

  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    console.log(error);
    this.logger.error(error);
    throw new InternalServerErrorException('Aiuda');
  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query.delete()
                        .where({})
                        .execute();
    } catch (error) {
      this.handleExceptions(error)
    }
  }
}
