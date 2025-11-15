import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const fields = (error.meta?.target as string[])?.join(', ');
        throw new ConflictException(
          `A record with this ${fields} already exists.`,
        );
      }

      case 'P2003': {
        const field = error.meta?.field_name as string;
        throw new BadRequestException(
          `Invalid input: The related ${field} does not exist.`,
        );
      }

      case 'P2025': {
        throw new NotFoundException('Record not found');
      }

      default:
        throw new BadRequestException(
          `Database error (Prisma code: ${error.code})`,
        );
    }
  }

  throw error;
}
