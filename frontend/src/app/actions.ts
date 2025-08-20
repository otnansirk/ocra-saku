'use server';

import {
  generateAuditReport,
  type GenerateAuditReportInput,
  type GenerateAuditReportOutput,
  type BrandSearchResult,
} from '@/ai/flows/generate-audit-report';
import { supabase } from '@/lib/supabase';


export async function getAuditReport(
  input: GenerateAuditReportInput
): Promise<GenerateAuditReportOutput> {
  try {
    const report = await generateAuditReport(input);
    return report;
  } catch (error) {
    console.error('Error generating audit report:', error);
    throw new Error('Failed to generate audit report.');
  }
}

export async function searchBrandName(
  brandName: string
): Promise<BrandSearchResult> {
  if (!supabase) {
    console.warn("Supabase client not initialized. Returning empty search results.");
    return {
      isRegistered: false,
      matchedMarks: [],
      confidence: 0,
    };
  }

  try {
    const { data, error } = await supabase
      .from('pdki_new_3')
      .select('logo_url, name, link, status, class, description, owner')
      .ilike('name', `%${brandName}%`)
      .limit(5);
    console.log("OKE KRISSS", data, brandName);

    if (error) {
      throw error;
    }

    const isRegistered = data.length > 0;
    const matchedMarks = data.map((item) => ({
      logoUrl: "https://" + item.logo_url,
      name: item.name,
      link: item.link,
      status: item.status,
      class: item.class,
      description: item.description,
      owner: item.owner,
    }));

    return {
      isRegistered,
      matchedMarks,
      confidence: isRegistered ? Math.random() : 0, // Placeholder confidence
    };
  } catch (error) {
    console.error('Error searching brand name:', error);
    throw new Error('Failed to search brand name.');
  }
}
