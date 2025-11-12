import fs from 'node:fs';
import nodePath from 'node:path';
import { absPath } from './path.js';

function copyImages() {
  return {
    name: 'copy-images',
    closeBundle() {
      const srcImgPath = absPath.img;
      const distImgPath = nodePath.join(absPath.dist, 'img');

      if (!fs.existsSync(srcImgPath)) {
        return;
      }

      // Создаем папку dist/img, если её нет
      if (!fs.existsSync(distImgPath)) {
        fs.mkdirSync(distImgPath, { recursive: true });
      }

      // Функция для рекурсивного копирования файлов
      function copyRecursive(src, dest) {
        const entries = fs.readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
          const srcPath = nodePath.join(src, entry.name);
          const destPath = nodePath.join(dest, entry.name);

          if (entry.isDirectory()) {
            // Создаем папку в dest, если её нет
            if (!fs.existsSync(destPath)) {
              fs.mkdirSync(destPath, { recursive: true });
            }
            // Рекурсивно копируем содержимое папки
            copyRecursive(srcPath, destPath);
          } else {
            // Копируем файл только если его еще нет в dest
            // (чтобы не перезаписывать оптимизированные версии от imagemin)
            if (!fs.existsSync(destPath)) {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        }
      }

      // Копируем все изображения из src/img в dist/img
      copyRecursive(srcImgPath, distImgPath);
    },
  };
}

export default copyImages;

