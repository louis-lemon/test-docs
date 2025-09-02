// Mock API 데이터 및 서버
import { EurekaDocument, EurekaApiResponse } from '@/types/eureka';
import mockData from '../../dummy/category_full_readme.json';

// Mock 데이터를 타입에 맞게 변환
export const mockDocuments: EurekaDocument[] = mockData.list.map((doc: any) => ({
  ...doc,
  // TODO: add something
}));

// Mock API 엔드포인트 함수들
export async function fetchDocuments(published = true): Promise<EurekaApiResponse> {
  // 실제 환경에서는 API 호출
  // const response = await fetch(`${API_URL}/api/documents?published=${published}`);
  // return response.json();

  // Mock 데이터 반환
  const filteredDocs = published
    ? mockDocuments.filter(doc => doc.publishedAt || !doc.deletedAt)
    : mockDocuments;

  return {
    limit: 2000,
    page: 0,
    list: filteredDocs,
    total: filteredDocs.length,
    aggr: null
  };
}

export async function fetchDocument(id: string): Promise<EurekaDocument | null> {
  // 실제 환경에서는 API 호출
  // const response = await fetch(`${API_URL}/api/documents/${id}`);
  // return response.json();

  // Mock 데이터에서 찾기
  return mockDocuments.find(doc => doc.id === id) || null;
}

export async function fetchCategories(): Promise<Map<string, number>> {
  const categories = new Map<string, number>();

  mockDocuments.forEach(doc => {
    if (doc.category) {
      categories.set(doc.category, (categories.get(doc.category) || 0) + 1);
    }
  });

  return categories;
}

export async function fetchChangedDocuments(since: number): Promise<string[]> {
  // 변경된 문서 ID 반환 (증분 빌드용)
  return mockDocuments
    .filter(doc => doc.updatedAt > since)
    .map(doc => doc.id);
}
