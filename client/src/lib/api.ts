const BASE_URL = 'http://localhost:8000/api';

export const api = {
  ingest: async () => {
    const res = await fetch(`${BASE_URL}/ingest`);
    if (!res.ok) throw new Error('Ingestion failed');
    return res.text();
  },

  retriveUnique: async (query: string, top_k: number, threshold: number) => {
    const res = await fetch(`${BASE_URL}/retrieve_unique` ,{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k, threshold: threshold / 100 })
    });
    if (!res.ok) throw new Error('Unique Retrieval failed');
    return res.json();
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
  
  feedback: async (
    query: string, 
    short_description: string, 
    resolution: string,
    desc: string = "",
    priority: string = "P4",
    issue_desc: string = "",
    rca: string = "",
    workaround: string = ""
  ) => {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query, 
        short_description, 
        resolution,
        desc,
        priority,
        issue_desc,
        rca,
        workaround
      })
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

  generateAnswer: async (issue_desc: string, rca: string, resolution: string, workaround: string) => {
    const res = await fetch(`${BASE_URL}/generate_answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue_desc, rca, resolution, workaround })
    });
    
    if (!res.ok) throw new Error('Generation failed');
    return res.json();
  }
};