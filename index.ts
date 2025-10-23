import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnnotationRequest {
  task_id: string;
  file_content: string;
  annotation_type: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { task_id, file_content, annotation_type }: AnnotationRequest = await req.json();

    const rows = file_content.split('\n').filter(row => row.trim());
    const annotations = [];

    for (let i = 0; i < Math.min(rows.length, 100); i++) {
      const row = rows[i];
      
      let annotationResult;
      
      switch (annotation_type) {
        case 'text-classification':
          annotationResult = {
            text: row,
            category: classifyText(row),
            confidence: Math.random() * 0.3 + 0.7,
          };
          break;
          
        case 'sentiment-analysis':
          annotationResult = {
            text: row,
            sentiment: analyzeSentiment(row),
            score: Math.random() * 2 - 1,
          };
          break;
          
        case 'named-entity-recognition':
          annotationResult = {
            text: row,
            entities: extractEntities(row),
          };
          break;
          
        case 'summarization':
          annotationResult = {
            text: row,
            summary: summarizeText(row),
          };
          break;
          
        default:
          annotationResult = {
            text: row,
            processed: true,
          };
      }
      
      annotations.push(annotationResult);
    }

    return new Response(
      JSON.stringify({
        success: true,
        task_id,
        annotations,
        total_processed: annotations.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function classifyText(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('sports') || lowerText.includes('game') || lowerText.includes('team')) {
    return 'Sports';
  } else if (lowerText.includes('tech') || lowerText.includes('software') || lowerText.includes('computer')) {
    return 'Technology';
  } else if (lowerText.includes('business') || lowerText.includes('market') || lowerText.includes('economy')) {
    return 'Business';
  } else if (lowerText.includes('health') || lowerText.includes('medical') || lowerText.includes('doctor')) {
    return 'Health';
  } else {
    return 'General';
  }
}

function analyzeSentiment(text: string): string {
  const lowerText = text.toLowerCase();
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'wonderful', 'best', 'happy'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'sad', 'poor', 'disappointing'];
  
  const hasPositive = positiveWords.some(word => lowerText.includes(word));
  const hasNegative = negativeWords.some(word => lowerText.includes(word));
  
  if (hasPositive && !hasNegative) return 'Positive';
  if (hasNegative && !hasPositive) return 'Negative';
  return 'Neutral';
}

function extractEntities(text: string): Array<{ text: string; type: string }> {
  const entities = [];
  
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails) {
    emails.forEach(email => entities.push({ text: email, type: 'EMAIL' }));
  }
  
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex);
  if (urls) {
    urls.forEach(url => entities.push({ text: url, type: 'URL' }));
  }
  
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
  if (capitalizedWords) {
    capitalizedWords.slice(0, 3).forEach(word => entities.push({ text: word, type: 'PERSON' }));
  }
  
  return entities;
}

function summarizeText(text: string): string {
  const words = text.split(' ');
  if (words.length <= 10) return text;
  
  return words.slice(0, 10).join(' ') + '...';
}