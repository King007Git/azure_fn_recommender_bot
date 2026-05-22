const BASE_URL = 'http://localhost:8000/api';

export const api = {
  ingest: async () => {
    const res = await fetch(`${BASE_URL}/ingest`);
    if (!res.ok) throw new Error('Ingestion failed');
    return res.text();
  },
  
  retrieve: async (query: string, top_k: number, threshold: number) => {
    const res = await fetch(`${BASE_URL}/retrieve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k, threshold: threshold / 100 })
    });
    if (!res.ok) throw new Error('Retrieval failed');
    return res.json();
  },
  
  feedback: async (query: string, short_description: string, resolution: string) => {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, short_description, resolution })
    });
    
    if (!res.ok) throw new Error('Feedback submission failed');
    return res.text(); 
  },

  remove: async (doc_ids: string[]) => {
    const res = await fetch(`${BASE_URL}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_ids })
    });
    
    if (!res.ok) throw new Error('Removal failed');
    return res.text();
  },

  generateAnswer: async (resolution: string) => {
    const res = await fetch(`${BASE_URL}/generate_answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution })
    });
    
    if (!res.ok) throw new Error('Generation failed');
    return res.json();
  }
};