export interface EmbeddingRequest {
  texts: string[];
  batch_size?: number;
}

export interface EmbeddingResponse {
  data_id: string;
  status: string;
  message?: string;
}

export class EmbeddingService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://81.15.150.181') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the base URL for debugging
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Test connectivity to the embedding service
   */
  async testConnectivity(): Promise<boolean> {
    try {
      console.log('Testing connectivity to:', `${this.baseUrl}/health`);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      console.log('Health check response status:', response.status);
      console.log('Health check response ok:', response.ok);
      
      if (response.ok) {
        const healthData = await response.json();
        console.log('Health check response data:', healthData);
      } else {
        const errorText = await response.text();
        console.error('Health check error response:', errorText);
      }
      
      return response.ok;
    } catch (error) {
      console.error('Health check failed with error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      return false;
    }
  }

  /**
   * Fast route - Embed Small (store KG + embeddings, return data_id)
   */
  async embedSmall(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    try {
      const requestBody = {
        texts: request.texts,
        batch_size: request.batch_size || 64
      };
      
      console.log('Embed Small Request URL:', `${this.baseUrl}/embed/small`);
      console.log('Embed Small Request Body:', requestBody);
      
      const response = await fetch(`${this.baseUrl}/embed/small`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Embed Small Response Status:', response.status);
      console.log('Embed Small Response OK:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Embed Small Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Embed Small Success Data:', data);
      
      return {
        data_id: data.data_id || data.id || '',
        status: 'success',
        message: data.message || 'Embedding completed successfully'
      };
    } catch (error) {
      console.error('Embed Small API Error Details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      throw new Error(`Embed Small failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Slow route - Embed Large (store KG + embeddings, return data_id)
   */
  async embedLarge(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/embed/large`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: request.texts,
          batch_size: request.batch_size || 32
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data_id: data.data_id || data.id || '',
        status: 'success',
        message: data.message || 'Embedding completed successfully'
      };
    } catch (error) {
      console.error('Embed Large API Error:', error);
      throw new Error(`Embed Large failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text content from file
   */
  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // For text files, return content directly
          if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            resolve(content);
          }
          // For JSON files, extract text fields
          else if (file.type === 'application/json' || file.name.endsWith('.json')) {
            const jsonData = JSON.parse(content);
            const texts = this.extractTextFromJson(jsonData);
            resolve(texts.join(' '));
          }
          // For other file types, return filename and basic info
          else {
            resolve(`${file.name} - ${file.type} - ${file.size} bytes`);
          }
        } catch (error) {
          reject(new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Extract text content from JSON object recursively
   */
  private extractTextFromJson(obj: any): string[] {
    const texts: string[] = [];
    
    if (typeof obj === 'string') {
      texts.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach(item => {
        texts.push(...this.extractTextFromJson(item));
      });
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(value => {
        texts.push(...this.extractTextFromJson(value));
      });
    }
    
    return texts;
  }
}
