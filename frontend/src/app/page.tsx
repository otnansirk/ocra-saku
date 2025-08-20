'use client';

import { ShieldCheck } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';

import type { BrandSearchResult, SimilarityResult, GenerateAuditReportOutput } from '@/ai/flows/generate-audit-report';
import { getAuditReport, searchBrandName } from '@/app/actions';

import { BrandSearchForm } from '@/components/brand-search-form';
import { LogoSimilarityForm } from '@/components/logo-similarity-form';
import { BrandResults } from '@/components/brand-results';
import { LogoResults } from '@/components/logo-results';
import { AuditReportCard } from '@/components/audit-report-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';


export default function Home() {
  const [brandResult, setBrandResult] = useState<BrandSearchResult | null>(null);
  const [logoResult, setLogoResult] = useState<SimilarityResult | null>(null);
  const [auditReport, setAuditReport] = useState<GenerateAuditReportOutput | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  const [isBrandLoading, setIsBrandLoading] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);

  const [isReportPending, startReportTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (brandResult && logoResult) {
      startReportTransition(async () => {
        try {
          const report = await getAuditReport({
            brandSearchResult: brandResult,
            similarityResult: logoResult,
          });
          setAuditReport(report);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to generate audit report.",
          });
        }
      });
    }
  }, [brandResult, logoResult, toast]);

  const handleBrandSearch = async (brandName: string) => {
    setIsBrandLoading(true);
    setBrandResult(null);
    setAuditReport(null);
    try {
      const result = await searchBrandName(brandName);
      setBrandResult(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search for brand name.",
      });
    } finally {
      setIsBrandLoading(false);
    }
  };

  const handleLogoAnalysis = (file: File) => {
    setIsLogoLoading(true);
    setLogoResult(null);
    setAuditReport(null);
    setLogoPreviewUrl(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate API call
    setTimeout(() => {
      setLogoResult({
        candidates: ['Similar Brand A', 'Competitor Logo B', 'Another Mark C'],
        similarityScore: Math.floor(Math.random() * 60) + 40, // 40-100
        possibleDuplicate: Math.random() > 0.3,
      });
      setIsLogoLoading(false);
    }, 2000);
  };

  const hasResults = brandResult || logoResult || isBrandLoading || isLogoLoading;

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Brand Audit Suite
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Check Your Brand's Uniqueness
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Enter your brand name and upload your logo to get a comprehensive audit report.
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              This is only for demo, so don’t expect too much from this design hehe.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <div className="flex flex-col gap-8">
              <BrandSearchForm onSubmit={handleBrandSearch} isLoading={isBrandLoading} />
              <LogoSimilarityForm onSubmit={handleLogoAnalysis} isLoading={isLogoLoading} />
            </div>

            <div className="flex flex-col gap-8">
              {hasResults ? (
                <div className="sticky top-24">
                  {isReportPending && (
                    <Card className="p-6">
                      <div className="flex flex-col gap-4">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <div className="flex gap-4 pt-4">
                          <Skeleton className="h-10 w-1/2" />
                          <Skeleton className="h-10 w-1/2" />
                        </div>
                      </div>
                    </Card>
                  )}
                  {auditReport && !isReportPending && <AuditReportCard data={auditReport} />}

                  <div className={`mt-8 grid grid-cols-1 gap-8 transition-opacity ${isReportPending || auditReport ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                    {isBrandLoading ? <Skeleton className="h-56 w-full" /> : brandResult && <BrandResults data={brandResult} />}
                    {isLogoLoading ? <Skeleton className="h-56 w-full" /> : (logoResult && <LogoResults data={logoResult} logoUrl={logoPreviewUrl} />)}
                  </div>
                </div>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed bg-card/50 lg:min-h-[600px]">
                  <div className="text-center">
                    <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Your results will appear here</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Start by searching a brand name or uploading a logo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
