import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderVariantDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  amount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderVariantDto)
  @IsOptional()
  variants?: OrderVariantDto[];
}
