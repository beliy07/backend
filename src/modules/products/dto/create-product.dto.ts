import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductVariantDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantOptionDto)
  @ArrayMinSize(1)
  options: ProductVariantOptionDto[];
}

export class ProductVariantOptionDto {
  @IsString()
  @IsNotEmpty()
  value: string;

  @IsNumber()
  @Min(1)
  price: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  images: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  @IsOptional()
  variants?: ProductVariantDto[];

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(1)
  productionDays: number;
}
