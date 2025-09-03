import { PrismaClient } from '@prisma/client'

//建立PrismaClient實例並將其導出,讓給其他檔案使用
export const prisma = new PrismaClient();

//可改寫
//const prisma = new PrismaClient();
//export default prisma;

