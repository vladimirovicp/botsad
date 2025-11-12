import lightGallery from 'lightgallery';
import 'lightgallery/css/lightgallery.css';

document.addEventListener('DOMContentLoaded', () => {
  const galleryContainer = document.getElementById('gallery');

  if (!galleryContainer) {
    return false;
  }

  lightGallery(galleryContainer, {
    selector: '.gallery-item',
    speed: 500,
    download: true,
    counter: true,
    plugins: [],
  });
});

