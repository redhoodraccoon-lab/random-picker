#!/bin/bash
rm -rf .next node_modules
chmod -R 755 .
npm install
npx prisma db push
npx prisma db seed
npm run build
