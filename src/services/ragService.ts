interface RAGRequest {
  data_id: string;
  query: string;
  top_k: number;
}

interface RAGResponse {
  answer: string;
  sources: Array<{
    content: string;
    score: number;
    metadata?: any;
  }>;
  data_id: string;
  query: string;
  processing_time?: number;
}

export class RAGService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/rag') {
    this.baseUrl = baseUrl;
  }

  private cleanRAGResponse(response: string): string {
    // Remove instruction formatting patterns
    let cleaned = response
      // Remove the entire [INST] block with all instructions
      .replace(/\[INST\][\s\S]*?\[SYSTEM\][\s\S]*?\[CONTEXTS_AND_KG\][\s\S]*?\[USER\]\s*Query:\s*[^\]]*?\[INSTRUCTIONS\][\s\S]*?\[\/INST\]/gi, '')
      // Remove standalone instruction tags
      .replace(/\[INST\]|\[SYSTEM\]|\[CONTEXTS_AND_KG\]|\[USER\]|\[INSTRUCTIONS\]|\[\/INST\]/gi, '')
      // Remove "Query:" labels and following content until actual answer
      .replace(/Query:\s*[^\n]*\n/gi, '')
      // Remove "Answer comprehensively" instruction text
      .replace(/Answer comprehensively[^\]]*?\./gi, '')
      // Remove "EOF by user" footer
      .replace(/>\s*EOF\s*by\s*user\s*$/gi, '')
      // Remove lines that start with "I'm an assistant" or similar
      .replace(/^I'm an assistant[^\n]*\n/gi, '')
      .replace(/^I'm a precise RAG assistant[^\n]*\n/gi, '')
      // Remove "Context:" labels and file info
      .replace(/Context:\s*[^\n]*\n/gi, '')
      .replace(/Size:\s*[^\n]*\n/gi, '')
      // Remove "If you have any specific query" ending
      .replace(/If you have any specific query[^\n]*$/gi, '')
      // Clean up extra whitespace and newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    // If the response still contains instruction-like content at the beginning, extract just the answer
    const lines = cleaned.split('\n');
    const answerStartIndex = lines.findIndex(line => {
      const lowerLine = line.toLowerCase().trim();
      return !lowerLine.includes('you are') && 
             !lowerLine.includes('assistant') && 
             !lowerLine.includes('context') &&
             !lowerLine.includes('knowledge graph') &&
             !lowerLine.includes('file named') &&
             !lowerLine.includes('size:') &&
             lowerLine.length > 0;
    });

    if (answerStartIndex > 0) {
      cleaned = lines.slice(answerStartIndex).join('\n').trim();
    }

    return cleaned;
  }

  async queryByDataId(dataId: string, query: string, topK: number = 5): Promise<RAGResponse> {
    const requestBody: RAGRequest = {
      data_id: dataId,
      query: query,
      top_k: topK
    };

    try {
      const response = await fetch(`${this.baseUrl}/rag/by_id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RAGResponse = await response.json();
      
      // Clean the response by removing instruction formatting
      if (data.answer) {
        data.answer = this.cleanRAGResponse(data.answer);
      }
      
      return data;
    } catch (error) {
      console.error('RAG API Error:', error);
      
      // If CORS error, try with a different approach
      if (error instanceof TypeError && error.message.includes('CORS')) {
        throw new Error('CORS error: The RAG service server needs to be configured to allow cross-origin requests from your domain.');
      }
      
      throw new Error(`Failed to query RAG system: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: 5000
      } as any);
      return response.ok;
    } catch (error) {
      console.warn('RAG service connectivity test failed:', error);
      return false;
    }
  }
}

export type { RAGRequest, RAGResponse };
