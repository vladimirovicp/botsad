import fs from 'node:fs';
import nodePath from 'node:path';
import { absPath } from './path.js';

function generateFolders() {
  return {
    name: 'generate-folders',
    closeBundle() {
      const distPath = absPath.dist;

      if (!fs.existsSync(distPath)) {
        return;
      }

      // Получаем все HTML файлы в dist
      const files = fs.readdirSync(distPath);
      const htmlFiles = files.filter((file) => file.endsWith('.html') && file !== 'index.html' && file !== '404.html');

      htmlFiles.forEach((htmlFile) => {
        const htmlPath = nodePath.join(distPath, htmlFile);
        const folderName = htmlFile.replace('.html', '');
        const folderPath = nodePath.join(distPath, folderName);
        const indexHtmlPath = nodePath.join(folderPath, 'index.html');

        // Создаем папку, если её нет
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        // Читаем содержимое HTML файла
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

        // Обрабатываем пути к ресурсам и ссылкам
        let modifiedContent = htmlContent;

        // Обрабатываем пути к ресурсам (js, css, img, font, data-theme.js, favicon)
        modifiedContent = modifiedContent.replace(
          /(href|src)=(["']?)([^"'\s>]+)\2/gi,
          (match, attr, quote, url) => {
            // Пропускаем внешние ссылки, data:, якоря
            if (!url || url.startsWith('http') || url.startsWith('www') || url.startsWith('data:') || url.startsWith('#')) {
              return match;
            }

            // Если путь уже начинается с ../, оставляем как есть
            if (url.startsWith('../')) {
              return match;
            }

            // Если путь начинается с ./, заменяем на ../
            if (url.startsWith('./')) {
              const newUrl = url.replace('./', '../');
              return `${attr}=${quote}${newUrl}${quote}`;
            }

            // Если путь содержит /src/, убираем /src/ из пути
            if (url.includes('/src/')) {
              let newUrl = url;
              // Если путь начинается с ../src/, убираем src/
              if (newUrl.startsWith('../src/')) {
                newUrl = newUrl.replace('../src/', '../');
              }
              // Если путь начинается с /src/, заменяем на ../
              else if (newUrl.startsWith('/src/')) {
                newUrl = newUrl.replace('/src/', '../');
              }
              // Если путь содержит /src/ в середине, убираем /src/
              else {
                newUrl = newUrl.replace(/\/src\//g, '/');
                // Если путь не начинается с ../, добавляем
                if (!newUrl.startsWith('../') && !newUrl.startsWith('./')) {
                  newUrl = `../${newUrl}`;
                }
              }
              return `${attr}=${quote}${newUrl}${quote}`;
            }

            // Если путь абсолютный (начинается с /), заменяем на ../
            if (url.startsWith('/')) {
              const newUrl = url.replace(/^\//, '../');
              return `${attr}=${quote}${newUrl}${quote}`;
            }

            // Если путь к ресурсу (js, css, img, font и т.д.), добавляем ../
            if (/^(js|css|img|font|data-theme\.js|favicon)/.test(url)) {
              return `${attr}=${quote}../${url}${quote}`;
            }

            // Если это ссылка на другую страницу без расширения, оставляем как есть
            // (например, /news, /contacts)
            if (url.startsWith('/') && !url.includes('.')) {
              return match;
            }

            return match;
          },
        );

        // Создаем index.html в папке
        fs.writeFileSync(indexHtmlPath, modifiedContent, 'utf-8');
      });
    },
  };
}

export default generateFolders;

