/**
 * OpenAPI Documentation Endpoint
 * Generates Swagger/OpenAPI 3.0 spec for dynamically created APIs
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createGeminiService } from '@/lib/gemini';
import { getGeminiApiKey } from '@/app/admin/actions';

export async function GET(
  request: Request,
  { params }: { params: { modelName: string } }
) {
  const modelName = params.modelName;

  // 1. Find the ApiModel in the database
  const model = await prisma.apiModel.findUnique({
    where: { name: modelName },
  });

  if (!model) {
    return NextResponse.json({ error: 'API Model not found' }, { status: 404 });
  }

  try {
    // 2. Get Gemini API key
    const geminiApiKey = await getGeminiApiKey();
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // 3. Create Gemini service and generate spec
    const gemini = createGeminiService(geminiApiKey);
    const openApiSpec = await gemini.generateOpenApiSpec(
      model.name,
      JSON.parse(model.schema),
      model.requiresAuth
    );

    // 4. Return the AI-generated JSON spec
    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}
