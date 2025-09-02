/**
 * GitHub Pages 배포를 위한 이미지 경로 유틸리티
 * basePath를 고려한 올바른 이미지 경로를 반환합니다.
 */

// 프로덕션 환경에서의 basePath
const basePath = process.env.NODE_ENV === 'production' ? '/test-docs' : '';

/**
 * 이미지 경로를 basePath와 함께 반환합니다.
 * @param imagePath - 이미지 경로 (예: '/images/example.jpg' 또는 'images/example.jpg')
 * @returns basePath가 포함된 완전한 이미지 경로
 */
export function getImagePath(imagePath: string): string {
  // 이미 절대 경로인 경우 basePath 추가
  if (imagePath.startsWith('/')) {
    return `${basePath}${imagePath}`;
  }
  
  // 상대 경로인 경우 / 추가 후 basePath 추가
  return `${basePath}/${imagePath}`;
}

/**
 * public 폴더의 이미지를 위한 헬퍼 함수
 * @param fileName - images 폴더 내의 파일명 (예: 'example.jpg')
 * @returns 완전한 이미지 경로
 */
export function getPublicImagePath(fileName: string): string {
  return getImagePath(`/images/${fileName}`);
}