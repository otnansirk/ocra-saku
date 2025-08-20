import type { SimilarityResult } from '@/ai/flows/generate-audit-report';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface LogoResultsProps {
  data: SimilarityResult;
  logoUrl: string | null;
}

export function LogoResults({ data, logoUrl }: LogoResultsProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Logo Similarity Results</CardTitle>
        <CardDescription>
          Analysis of your logo's visual uniqueness.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {logoUrl && (
          <div className="mb-4 flex justify-center">
            <Image
              src={logoUrl}
              alt="Uploaded Logo"
              width={128}
              height={128}
              className="rounded-lg object-contain h-32 w-32"
            />
          </div>
        )}
        <div className="flex items-baseline justify-between rounded-lg bg-muted p-4">
            <span className="text-sm font-medium text-muted-foreground">Similarity Score</span>
            <span className="text-3xl font-bold text-primary">{data.similarityScore}%</span>
        </div>

        {data.possibleDuplicate && (
            <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Possible duplicate detected.</span>
            </div>
        )}

        <div>
            <h4 className="font-semibold mb-2">Potential Conflicts:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
                {data.candidates.map((candidate, index) => (
                    <li key={index}>{candidate}</li>
                ))}
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
