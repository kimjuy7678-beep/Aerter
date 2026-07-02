import type { InstagramPost } from '../types';
import { imgInsta1, imgInsta2, imgInsta3 } from '../assets/images';

export const instagramPosts: InstagramPost[] = [
  {
    id: 'post-1',
    image: imgInsta1,
    alt: 'AERHER 차일드피치 향수 — 복숭아와 함께한 봄날의 순간',
    link: 'https://www.instagram.com/p/DaQGyGWKJ5N/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
  },
  {
    id: 'post-2',
    image: imgInsta2,
    alt: 'AERHER 퓨어코튼 향수 — 포근하고 청결한 일상의 위로',
    link: 'https://www.instagram.com/p/DaQHDoHo4oL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
  },
  {
    id: 'post-3',
    image: imgInsta3,
    alt: 'AERHER 딥우디 향수 — 깊고 고요한 숲의 정취',
    link: 'https://www.instagram.com/p/DaQG7ebojB1/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==',
  },
];
