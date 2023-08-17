import type { CellModel } from '$/commonTypesWithClient/models';
import { userIdParser } from '$/service/idParsers';
import { prismaClient } from '$/service/prismaClient';
import type { Cell } from '@prisma/client';
import { z } from 'zod';
const toCellModel = (prismaCell: Cell): CellModel => ({
  x: z.number().min(0).parse(prismaCell),
  y: z.number().min(0).parse(prismaCell.y),
  isBombCell: z.boolean().parse(prismaCell.isBombCell),
  cellValue: z.number().min(0).parse(prismaCell.cellValue),
  whoOpened: userIdParser.parse(prismaCell.whoOpened),
  whenOpened: prismaCell.whenOpened.getTime(),
  isUserInput: z.boolean().parse(prismaCell.isUserInput),
});

export const cellsRepository = {
  create: async (cell: CellModel): Promise<CellModel> => {
    const newCell = { ...cell, whenOpened: new Date(cell.whenOpened) };
    const prismaCell = await prismaClient.cell.create({
      data: newCell,
    });
    return toCellModel(prismaCell);
  },
  findAll: async (): Promise<CellModel[]> => {
    const prismaCells = await prismaClient.cell.findMany({
      orderBy: { x: 'asc', y: 'asc' },
    });
    return prismaCells.map(toCellModel);
  },
  find: async (x: number, y: number): Promise<CellModel | null> => {
    const prismaCell = await prismaClient.cell.findUnique({ where: { pos: { x, y } } });
    return prismaCell !== null ? toCellModel(prismaCell) : null;
  },
};
